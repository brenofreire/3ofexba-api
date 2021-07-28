import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import Campanha from 'App/Models/Campanha'
import Capitulo from 'App/Models/Capitulo'
import { lowerLike, withExtras } from 'App/Utils/Utils'
import Env from '@ioc:Adonis/Core/Env'
import TipoCampanhasController from './TipoCampanhasController'

export default class CapitulosController {
  private tiposCampanhaCtrl = new TipoCampanhasController()

  public async cadastrarEditarCapitulo({ request, response }: HttpContextContract) {
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
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0019' })
      }
      return response.badRequest({
        mensagem: 'Erro ao cadasrtrar capítulo, tente novamente mais tarde',
        codigo: 'err_0018',
      })
    }
  }

  public async buscarCapitulo({ request, response }: HttpContextContract) {
    try {
      const dadosBusca = await request.validate({
        schema: schema.create({
          ofex: schema.number(),
          termoBusca: schema.string.optional(),
        }),
        messages: { 'ofex.required': 'O número da Ofex é obrigatório' },
      })

      const capitulos = await Capitulo.query()
        .where((q) => {
          if (dadosBusca.termoBusca) {
            q.whereRaw(lowerLike('nome', dadosBusca.termoBusca, Env.get('DB_CONNECTION') as any))
            q.orWhereRaw(lowerLike('sigla', dadosBusca.termoBusca, Env.get('DB_CONNECTION') as any))
          }
        })
        .andWhere({ ofex: dadosBusca.ofex })
        .limit(10)
        .offset(request.input('offset'))

      return response.ok(capitulos)
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0022' })
      }
      return response.badRequest({ mensagem: 'Erro ao buscar capítulos', code: 'err_0021' })
    }
  }

  public async buscarTodosCapitulos({ request, response }: HttpContextContract) {
    try {
      const dadosBusca = await request.validate({
        schema: schema.create({
          termoBusca: schema.string.optional(),
        }),
      })

      const capitulos = await Capitulo.query()
        .where((q) => {
          if (dadosBusca.termoBusca) {
            q.whereRaw(lowerLike('nome', dadosBusca.termoBusca, Env.get('DB_CONNECTION') as any))
            q.orWhereRaw(lowerLike('sigla', dadosBusca.termoBusca, Env.get('DB_CONNECTION') as any))
          }
        })
        .limit(10)
        .offset(request.input('offset') || 0)

      return response.ok(capitulos)
    } catch (error) {
      console.log({ error })

      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0039' })
      }
      return response.badRequest({ mensagem: 'Erro ao buscar capítulos', code: 'err_0040' })
    }
  }

  async getRegioes({ response }: HttpContextContract) {
    try {
      const regioes = await (await Capitulo.query().select('ofex').groupBy('ofex')).map((regiao) => regiao.ofex)

      return response.ok(regioes)
    } catch (error) {
      return response.internalServerError({
        mensagem: 'Erro ao listar regiões',
        code: 'err_0035',
      })
    }
  }
  async getCampanhasAdmin({ request, response }: HttpContextContract) {
    try {
      const TiposCampanhaEnumReverso = (await this.tiposCampanhaCtrl.getTipoCampanhas()).TiposCampanhaEnumReverso
      const campanhasAdmin = withExtras(
        await Campanha.query()
          .whereRaw(lowerLike('nome', request.input('termoBusca'), Env.get('DB_CONNECTION') as any))
          .offset(request.input('offset'))
          .limit(10)
      )

      for (const item in campanhasAdmin) {
        campanhasAdmin[item]['tipoLabel'] = TiposCampanhaEnumReverso[campanhasAdmin[item].tipo]
      }

      return response.ok(campanhasAdmin)
    } catch (error) {
      return response.internalServerError({
        mensagem: 'Erro ao listar campanhas do admin',
        code: 'err_0036',
      })
    }
  }

  async deletarCapitulo({ request, response }: HttpContextContract) {
    try {
      const capitulo: Capitulo = request.input('capitulo')

      const deleteCapitulo = await Capitulo.query().where({ id: capitulo.id }).del()

      return response.ok(deleteCapitulo)
    } catch (error) {
      console.log(error)

      return response.internalServerError({
        mensagem: 'Erro ao deletar capítulo',
        code: 'err_0041',
      })
    }
  }
}
