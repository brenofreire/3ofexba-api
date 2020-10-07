import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Usuario from 'App/Models/Usuario'
import { getRuleError, rolesEnum, gerarTokenJWT, statusUsuario, cargosEnum } from 'App/Utils/Utils'
import Hash from '@ioc:Adonis/Core/Hash'

export default class UsuariosController {
  public async cadastro ({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          email: schema.string({}, [
            rules.email(),
            rules.unique({ table: 'usuarios', column: 'email' }),
          ]),
          id_demolay: schema.number([
            rules.unique({ table: 'usuarios', column: 'id_demolay' }),
          ]),
          password: schema.string({}, [rules.minLength(6)]),
          capitulo: schema.number(),
        }),
        messages: {
          'email.unique': 'Email já registrado no sistema',
          'email.email': 'Email inválido',
          'id_demolay.unique': 'ID Demolay já regsitrado no sistema',
          'password.minLength': 'Senha deve ter no mínimo 6 caracteres',
          'capitulo.required': 'O número do capítulo é obrigatório',
        },
      })

      await Usuario.create({
        ...dadosCadastro,
        role: rolesEnum[0],
        status: 0,
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

  public async login ({ request, response }: HttpContextContract) {
    try {
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

      const usuario = await Usuario.query()
        .where({ email: dadosCadastro.email })
        .preload('capituloInfo', q => {
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

  public async mudarStatusUsuario ({ request, response }: HttpContextContract) {
    try {
      const dadosAceitarCadastro = await request.validate({
        schema: schema.create({
          email: schema.string({}, [
            rules.exists({
              table: 'usuarios', column: 'email',
            }),
          ]),
          role: schema.enum(rolesEnum),
          status: schema.enum(statusUsuario),
          cargo: schema.enum.optional(cargosEnum),
          password: schema.string.optional({}, [rules.minLength(6)]),
        }),
      })

      const dadosAtualizados = {
        role: dadosAceitarCadastro.role,
        status: statusUsuario.indexOf(dadosAceitarCadastro.status),
        cargo: dadosAceitarCadastro.cargo,
        password: dadosAceitarCadastro.password && await Hash.make(<any>dadosAceitarCadastro.password),
      }

      if (!dadosAtualizados.password) {
        delete dadosAtualizados.password
      }

      if (!dadosAtualizados.cargo) {
        delete dadosAtualizados.cargo
      }

      await Usuario.query().update(dadosAtualizados).where({ email: dadosAceitarCadastro.email })

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
}
