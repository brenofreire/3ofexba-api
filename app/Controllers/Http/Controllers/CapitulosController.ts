import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Capitulo from 'App/Models/Capitulo'

export default class CapitulosController {
  public async cadastrarEditarCapitulo ({ request, response }: HttpContextContract) {
    try {
      const dadosCadastro = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          numero: schema.number(),
          sigla: schema.string({}, [rules.maxLength(8)]),
          ofex: schema.number(),
        }),
        messages: {
          'nome.required': 'O nome do capítulo é obrigatório',
          'numero.required': 'O número do capítulo é obrigatório',
          'sigla.required': 'A sigla do capítulo é obrigatória',
          'sigla.maxLength': 'A sigla do capítulo deve ter no máximo 8 caracteres',
          'ofex.required': 'O número da Ofex é obrigatório',
        },
      })

      await Capitulo.updateOrCreate({ numero: dadosCadastro.numero }, dadosCadastro)

      return response.ok({ mensagem: 'Ação realizada com sucesso' })
    } catch (error) {
      if(error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0019' })
      }
      return response.badRequest({
        mensagem: 'Erro ao cadasrtrar capítulo, tente novamente mais tarde',
        codigo: 'err_0018',
      })
    }
  }

  public async buscarCapitulo ({ request, response }: HttpContextContract) {
    try {
      const dadosBusca = await request.validate({
        schema: schema.create({
          ofex: schema.number(),
          termoBusca: schema.string.optional(),
        }),
        messages: { 'ofex.required': 'O número da Ofex é obrigatório' },
      })

      const capitulos = await Capitulo.query()
        .where(q => {
          if(dadosBusca.termoBusca) {
            q.whereRaw(`LOWER(nome) LIKE '%${dadosBusca.termoBusca}%'`)
            q.orWhereRaw(`LOWER(sigla) LIKE '%${dadosBusca.termoBusca}%'`)
          }
        })
        .andWhere({ ofex: dadosBusca.ofex })

      return response.ok(capitulos)
    } catch (error) {
      if(error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0022' })
      }
      return response.badRequest({ mensagem: 'Erro ao buscar capítulos', code: 'err_0021' })
    }
  }
}
