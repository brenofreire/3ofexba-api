import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { cargosEnum, getRuleError } from 'App/Utils/Utils'
import Agostinho from 'App/Models/Agostinho'

export default class AgostinhoController {
  public async enviarMensagem({ request, response }: HttpContextContract) {
    const dadosMensagem = await request.validate({
      schema: schema.create({
        mensagem: schema.string(),
        destinatarios: schema.array().members(
          schema.enum(cargosEnum)
        ),
        remetente: schema.number()
      }),
      messages: {
        required: '{{ field }} é obrigatório',
        enum: '{{ field }} tipo inválido',
      },
    })

    try {
      for (const key in dadosMensagem) {
        if(Array.isArray(dadosMensagem[key])) {
          dadosMensagem[key] = JSON.stringify(dadosMensagem[key])
        }
      }

      await Agostinho.create(<any>dadosMensagem)

      return response.ok({ mensagem: 'Mensagem enviada com sucesso!' })
    } catch (error) {
      console.log('Erro enviar mensagem: ', error)

      const [rule, field] = getRuleError(error)
      if (rule === 'required') {
        return response.badRequest({ mensagem: `${field} inválido`, code: 'err_0031' })
      } else {
        return response.badRequest({ mensagem: 'Houve um erro ao enviar mensagem', code: 'err_0032' })
      }
    }
  }

  public async getMensagens({ request, response }: HttpContextContract) {
    const opcoesListaMensagens = await request.validate({
      schema: schema.create({
        offset: schema.string(),
      }),
      messages: {
        required: '{{ field }} é obrigatório',
        enum: '{{ field }} tipo inválido',
      },
    })

    try {
      const usuario = request.input('usuario')
      const mensagens = await Agostinho.query().select()
        .offset(Number(opcoesListaMensagens.offset))
        .whereRaw(`destinatarios LIKE '%${usuario.cargo}%'`)
        .limit(10)

      return response.ok(mensagens)
    } catch (error) {
      return response.internalServerError({
        mensagem: 'Houve um erro inesperado ao listar mensagens',
        code: 'err_0033'
      })
    }
  }
}
