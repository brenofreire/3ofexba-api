import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Campanha from 'App/Models/Campanha'
// import { schema } from '@ioc:Adonis/Core/Validator'
import {
  TiposCampanhaEnumReverso,
  statusAtividade,
  withExtras,
  statusAtividadeLabel,
  getRuleError,
} from '../../../Utils/Utils'
import Tarefa from 'App/Models/Tarefa'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class TarefasController {
  public async getResumoCampanhas ({ request, response }: HttpContextContract) {
    try {
      let validacaoResumo:any = {}
      if(request.input('usuario').role === 'admin') {
        validacaoResumo = await request.validate({
          schema: schema.create({
            capitulo: schema.string(),
          }),
        })
      }

      const campanhas = await Campanha.query().select('*').count('id', 'quantidade').groupBy('tipo')
      const tarefsDoCapitulo = await Tarefa.query().select('capitulo', 'tipo_campanha')
        .count('id', 'concluidas')
        .groupBy(['tipo_campanha'])
        .where({
          capitulo: validacaoResumo.capitulo || request.input('usuario').capitulo,
          status: statusAtividade.indexOf('atividade-aprovada'),
        })

      if (!campanhas.length) {
        throw ({ mensagem: 'Parece que ainda não tem atividades cadastradas no sistema', code: 'err_0010' })
      }

      const novoRetorno = {}
      campanhas.forEach(campanha => {
        const tarefaInfo = tarefsDoCapitulo.find(tarefa => tarefa.tipo_campanha === campanha.tipo)
        novoRetorno[TiposCampanhaEnumReverso[campanha.tipo]] = {
          concluidas: tarefaInfo && tarefaInfo.concluidas || 0,
          campanhasAtivas: campanha.quantidade,
        }
      })

      return response.ok(novoRetorno)
    } catch (error) {
      const [rule, field] = getRuleError(error)
      if (rule === 'required') {
        return response.badRequest({ mensagem: `${field} inválido`, code: 'err_0017' })
      } else if (error && error.mensagem) {
        return response.notFound(error)
      } else {
        return response.badRequest({ mensagem: 'Houve um erro ao listar atividades do capítulo', code: 'err_0011' })
      }
    }
  }

  public async getCampanhaDetalhada ({ request, params, response }: HttpContextContract) {
    if (!params.tipoCampanha) {
      return response.badRequest({ mensagem: 'Parâmetro [tipoCampanha] não informado', code: 'err_0012' })
    }

    try {
      const campanhas = withExtras(await Campanha.query().select('*').where({ tipo: params.tipoCampanha }))
      const tarefsDoCapitulo = withExtras(await Tarefa.query().select('*').where({
        capitulo: request.input('usuario').capitulo,
        tipoCampanha: params.tipoCampanha,
      }))

      if (!campanhas.length) {
        throw ({ mensagem: 'Parece que ainda não tem atividades cadastradas no sistema', code: 'err_0013' })
      }

      campanhas.map(campanha => {
        tarefsDoCapitulo.find(tarefa => {
          if (tarefa.slug_campanha === campanha.slug) {
            campanha.statusCapitulo = tarefa.status
            campanha.statusCapituloSlug = statusAtividade[tarefa.status]
            campanha.statusCapituloLabel = statusAtividadeLabel[tarefa.status]

            return tarefa
          } else {
            campanha.statusCapitulo = 0
            campanha.statusCapituloSlug = statusAtividade[0]
            campanha.statusCapituloLabel = statusAtividadeLabel[0]
          }
        })

        return campanha
      })

      return response.ok(campanhas)
    } catch (error) {
      if (error && error.mensagem) {
        return response.notFound(error)
      } else {
        return response.badRequest({ mensagem: 'Houve um erro ao detalhar informações de campanha', code: 'err_0014' })
      }
    }
  }
}
