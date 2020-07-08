import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Usuario from 'App/Models/Usuario'
import { getRuleError, roles, gerarTokenJWT } from 'App/Utils/Utils'
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
          password: schema.string(),
          capitulo: schema.number(),
        }),
      })

      const usuario = await Usuario.create({
        ...dadosCadastro,
        role: roles[0],
        status: 0,
      })

      const token = gerarTokenJWT(usuario)

      return response.ok({ mensagem: 'Usuário criado com sucesso', usuario, token })
    } catch (error) {
      if (getRuleError(error) === 'unique') {
        return response.badRequest({ mensagem: 'Email já registrado', codigo: 'err_0001' })
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
              table: 'usuarios', column: 'email',
            }),
          ]),
          password: schema.string({}, []),
        }),
      })

      const usuario = await Usuario.query().where({ email: dadosCadastro.email }).firstOrFail()
      const senhaCorreta = await Hash.verify(usuario.password, request.input('password'))

      if(senhaCorreta) {
        return response.ok({ usuario, token: gerarTokenJWT(usuario) })
      } else {
        throw { mensagem: 'Credenciais incorretas' }
      }
    } catch (error) {
      if (getRuleError(error) === 'exists') {
        return response.badRequest({ mensagem: 'Email não cadastrado', code: 'err_0003' })
      } else if(error.mensagem) {
        return response.badRequest({ error: error.mensagem, code: 'err_0004' })
      }
      return response.badRequest({ error: 'Erro ao fazer login', code: 'err_0005' })
    }
  }
}
