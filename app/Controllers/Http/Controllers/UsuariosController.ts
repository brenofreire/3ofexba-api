import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Usuario from 'App/Models/Usuario'
import { getRuleError, rolesEnum, gerarTokenJWT, statusUsuario, lowerLike } from 'App/Utils/Utils'
import Hash from '@ioc:Adonis/Core/Hash'
import TipoUserCargos from 'App/Models/TipoUserCargo'

export default class UsuariosController {
  public async cadastro({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string({}, [rules.minLength(3)]),
          email: schema.string({}, [rules.email(), rules.unique({ table: 'usuarios', column: 'email' })]),
          id_dm: schema.number([rules.unique({ table: 'usuarios', column: 'id_dm' })]),
          password: schema.string({}, [rules.minLength(6)]),
          capitulo: schema.number(),
        }),
        messages: {
          'email.unique': 'Email já registrado no sistema',
          'email.email': 'Email inválido',
          'id_dm.unique': 'ID já regsitrado no sistema',
          'password.minLength': 'Senha deve ter no mínimo 6 caracteres',
          'capitulo.required': 'O número do capítulo é obrigatório',
          'nome.minLength': 'O nome deve ter ao menos 3 letras',
        },
      })

      await Usuario.create({
        ...dadosCadastro,
        role: rolesEnum[2],
        status: 3,
      })

      return response.ok({ mensagem: 'Usuário criado com sucesso' })
    } catch (error) {
      const [rule] = getRuleError(error)

      if (rule) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, codigo: 'err_0001' })
      }
      return response.badRequest({ error, codigo: 'err_0002' })
    }
  }

  public async login({ request, response }: HttpContextContract) {
    const dadosCadastro = await request.validate({
      schema: schema.create({
        email: schema.string({}, [
          rules.exists({
            table: 'usuarios',
            column: 'email',
            where: { status: 1 },
          }),
        ]),
        password: schema.string({}, [rules.minLength(6)]),
      }),
    })

    try {
      const usuario = await Usuario.query()
        .where({ email: dadosCadastro.email })
        .preload('capituloInfo', (q) => {
          q.select('nome')
        })
        .firstOrFail()

      const senhaCorreta = await Hash.verify(usuario.password, request.input('password'))

      if (senhaCorreta) {
        return response.ok({ usuario, token: gerarTokenJWT(usuario) })
      } else {
        throw { mensagem: 'Credenciais incorretas' }
      }
    } catch (error) {
      if (error && error.mensagem) {
        return response.forbidden({ mensagem: error.mensagem, code: 'err_0004' })
      }
      try {
        const [rule, field] = getRuleError(error)
        if (rule === 'minLength' || rule === 'required') {
          return response.badRequest({ mensagem: `${field} inválido`, code: 'err_0003' })
        }
        if (rule === 'exists') {
          return response.badRequest({ mensagem: `${field} não cadastrado`, code: 'err_0025' })
        }
      } catch (error) {
        return response.badRequest({ mensagem: 'Erro ao fazer login', code: 'err_0005' })
      }
    }
  }

  public async mudarStatusUsuario({ request, response }: HttpContextContract) {
    const dadosAceitarCadastro = await request.validate({
      schema: schema.create({
        id: schema.number(),
        nome: schema.string(),
        email: schema.string({}, [
          rules.exists({
            table: 'usuarios',
            column: 'email',
          }),
        ]),
        role: schema.enum(rolesEnum),
        status: schema.enum(statusUsuario),
        cargo: schema.string.optional(),
        capitulo: schema.number(),
        password: schema.string.optional({}, [rules.minLength(6)]),
      }),
    })

    try {
      const dadosAtualizados = {
        nome: dadosAceitarCadastro.nome,
        email: dadosAceitarCadastro.email,
        role: dadosAceitarCadastro.role,
        status: statusUsuario.indexOf(dadosAceitarCadastro.status),
        cargo: dadosAceitarCadastro.cargo,
        capitulo: dadosAceitarCadastro.capitulo,
        password: dadosAceitarCadastro.password && (await Hash.make(<any>dadosAceitarCadastro.password)),
      }

      if (!dadosAtualizados.password) {
        delete dadosAtualizados.password
      }

      if (!dadosAtualizados.cargo) {
        delete dadosAtualizados.cargo
      }

      await Usuario.query().update(dadosAtualizados).where({ id: dadosAceitarCadastro.id })

      return response.ok({ mensagem: 'Status de usuário alterado com sucesso!' })
    } catch (error) {
      const [rule, field] = getRuleError(error)

      if (rule === 'enum' || rule === 'minLength') {
        return response.badRequest({ mensagem: `${field} inválido`, code: 'err_0016' })
      } else if (rule === 'exists') {
        return response.badRequest({ mensagem: `${field} não cadastrado`, code: 'err_0007' })
      } else if (error.mensagem) {
        return response.badRequest({ error: error.mensagem, code: 'err_0008' })
      }
      return response.badRequest({ error: 'Erro ao alterar stauts de usuário', code: 'err_0009' })
    }
  }

  public async cadastrarCargo({ request, response }: HttpContextContract) {
    const dadosCargo = await request.validate({
      schema: schema.create({
        nome: schema.string(),
        sigla: !request.input('id')
          ? schema.string({}, [
              rules.unique({
                table: 'tipo_user_cargos',
                column: 'sigla',
                where: {
                  sigla: request.input('sigla'),
                },
              }),
            ])
          : schema.string(),
      }),
      messages: {
        'required': '{{ field }} é obrigatório',
        'enum': '{{ field }} tipo inválido',
        'slug.unique': 'Atividade já cadastrada',
      },
    })
    try {
      await TipoUserCargos.updateOrCreate({ slug: request.input('slug') }, dadosCargo)

      return response.ok({ mensagem: 'Ação realizada com sucesso' })
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0029' })
      }

      return response.badRequest({ mensagem: 'Houve um erro ao realização ação', code: 'err_0037' })
    }
  }

  async getTiposCargo({ response }: HttpContextContract) {
    const tipos = await this.getTiposCargoGeneric()

    return response.ok(tipos.tiposUserCargosEnumReverse)
  }

  async getTiposCargoGeneric() {
    const tiposCargo = await TipoUserCargos.all()
    const tiposUserCargosEnumReverse = {}

    tiposCargo.forEach((tipo) => {
      tiposUserCargosEnumReverse[tipo.slug] = tipo.nome
    })

    return {
      tiposUserCargosEnum: tiposCargo.map((item) => item.slug),
      tiposUserCargosEnumReverse,
    }
  }

  async getUsuariosAdmin({ request, response }: HttpContextContract) {
    const filtroStatus = request.input('filtroStatus')
    const usuarios = await Usuario.query()
      .select()
      .where((q) => {
        if (request.input('nao-aprovados')) {
          q.where({ status: 0 })
        }
      })
      .where((q) => {
        if (request.input('termoBusca')) {
          q.whereRaw(lowerLike('nome', request.input('termoBusca')))
          q.orWhereRaw(lowerLike('email', request.input('termoBusca')))
          q.orWhereRaw(lowerLike('capitulo', request.input('termoBusca')))
          q.orWhereRaw(lowerLike('id_demolay', request.input('termoBusca')))
        }
      })
      .where((q) => {
        if (filtroStatus && statusUsuario.includes(filtroStatus)) {
          q.where({ status: statusUsuario.indexOf(filtroStatus) })
        }
      })
      .offset(request.input('offset'))
      .limit(10)

    for (const key in usuarios) {
      usuarios[key].status = <any>statusUsuario[usuarios[key].status]
    }

    return response.ok(usuarios)
  }
}
