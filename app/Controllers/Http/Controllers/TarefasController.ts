import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Campanha from 'App/Models/Campanha'
import {
  TiposCampanhaEnumReverso,
  statusAtividade,
  withExtras,
  statusAtividadeLabel,
  getRuleError,
  TiposCampanhaEnum,
  cargosEnum,
} from '../../../Utils/Utils'
import Tarefa from 'App/Models/Tarefa'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class TarefasController {
  public async getResumoCampanhas({ request, response }: HttpContextContract) {
    try {
      let validacaoResumo: any = {}
      let lowerLikeNomeCampanha = ''
      if (request.input('usuario').role === 'admin') {
        const termoBusca = request.input('termoBusca')
        validacaoResumo = await request.validate({
          schema: schema.create({
            capitulo: schema.string(),
          }),
        })
        lowerLikeNomeCampanha = termoBusca && `LOWER(nome) LIKE '%${termoBusca}%'` || ''
      }
      const campanhas = await Campanha.query().select('*').count('id', 'quantidade').groupBy('tipo')
      const tarefasDoCapitulo = await Tarefa.query().select('capitulo', 'tipo_campanha')
        .count('id', 'concluidas')
        .groupBy(['tipo_campanha'])
        .where({
          capitulo: validacaoResumo.capitulo || request.input('usuario').capitulo,
          status: statusAtividade.indexOf('atividade-aprovada'),
        })
        .whereRaw(lowerLikeNomeCampanha)        

      if (!campanhas.length) {
        throw ({ mensagem: 'Parece que ainda não tem atividades cadastradas no sistema', code: 'err_0010' })
      }

      const novoRetorno: any = []
      campanhas.map(campanha => {
        const tarefaInfo = tarefasDoCapitulo.find(tarefa => tarefa.tipo_campanha === campanha.tipo)
        novoRetorno.push({
          nome: TiposCampanhaEnumReverso[campanha.tipo],
          slug: campanha.tipo,
          concluidas: tarefaInfo && tarefaInfo.concluidas || 0,
          ativas: campanha.quantidade,
          cargoTarefa: JSON.parse(campanha.cargo_tarefa),
        })
      })

      return response.ok(novoRetorno)
    } catch (error) {
      const [rule, field] = getRuleError(error)
      if (rule === 'required') {
        return response.badRequest({ mensagem: `${field} inválido`, code: 'err_0017' })
      } else if (error && error.mensagem) {
        return response.badRequest(error)
      } else {
        return response.badRequest({ mensagem: 'Houve um erro ao listar atividades do capítulo', code: 'err_0011' })
      }
    }
  }

  public async getCampanhaDetalhada({ request, params, response }: HttpContextContract) {
    if (!params.tipoCampanha) {
      return response.badRequest({ mensagem: 'Parâmetro [tipoCampanha] não informado', code: 'err_0012' })
    }

    try {
      const campanhas = withExtras(await Campanha.query().select('*').where({ tipo: params.tipoCampanha }))
      const tarefasDoCapitulo = withExtras(await Tarefa.query().select('*').where({
        capitulo: request.input('usuario').capitulo,
        tipoCampanha: params.tipoCampanha,
      }))

      if (!campanhas.length) {
        throw ({ mensagem: 'Parece que ainda não tem atividades cadastradas no sistema', code: 'err_0013' })
      }

      campanhas.map(campanha => {
        const setTarefaNaoRealizada = () => {
          campanha.statusCapitulo = 0
          campanha.statusCapituloSlug = statusAtividade[0]
          campanha.statusCapituloLabel = statusAtividadeLabel[0]
          delete campanha.id
        }

        if (tarefasDoCapitulo && tarefasDoCapitulo.length) {
          tarefasDoCapitulo.find(tarefa => {
            if (tarefa.slug_campanha === campanha.slug) {
              campanha.statusCapitulo = tarefa.status
              campanha.statusCapituloSlug = statusAtividade[tarefa.status]
              campanha.statusCapituloLabel = statusAtividadeLabel[tarefa.status]
              campanha.id = tarefa.id

              return tarefa
            } else {
              setTarefaNaoRealizada()
            }
          })
        } else {
          setTarefaNaoRealizada()
        }

        return campanha
      })

      return response.ok({
        tituloTarefa: TiposCampanhaEnumReverso[params.tipoCampanha],
        tarefas: campanhas
      })
    } catch (error) {
      if (error && error.mensagem) {
        return response.notFound(error)
      } else {
        return response.badRequest({ mensagem: 'Houve um erro ao detalhar informações de campanha', code: 'err_0014' })
      }
    }
  }

  public async enviarTarefa({ request, response }: HttpContextContract) {
    try {
      const dadosTarefa = await request.validate({
        schema: schema.create({
          slugCampanha: schema.string(),
          tipoCampanha: schema.enum(TiposCampanhaEnum),
        }),
        messages: {
          required: '{{ field }} é obrigatório',
          enum: '{{ field }} tipo inválido',
        },
      })

      const jaExisteTarefa = await Tarefa.query().where({
        idDemolay: request.input('usuario').id,
        slugCampanha: dadosTarefa.slugCampanha,
        tipoCampanha: dadosTarefa.tipoCampanha,
      }).first()

      if (jaExisteTarefa) {
        return response.ok({ mensagem: 'Atividade já cadastrada' })
      } else {
        await Tarefa.create({
          slugCampanha: dadosTarefa.slugCampanha,
          tipoCampanha: dadosTarefa.tipoCampanha,
          capitulo: request.input('usuario').capitulo,
          idDemolay: request.input('usuario').id,
          status: statusAtividade.indexOf('atividade-nao-formulada'),
        })

        return response.ok({ mensagem: 'Atividade enviada com sucesso' })
      }
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0024' })
      }

      return response.badRequest({ mensagem: 'Houve um erro ao cadastar nova atividade', code: 'err_0020' })
    }
  }

  public async editarTarefa({ request, response }: HttpContextContract) {
    try {
      const usuario = request.input('usuario')
      const dadosTarefa = await request.validate({
        schema: schema.create({
          idTarefa: schema.number([rules.exists({
            column: 'id',
            table: 'tarefas',
            where: { id_demolay: usuario.id }
          })]),
          status: schema.enum(statusAtividade),
        }),
        messages: {
          required: '{{ field }} é obrigatório',
          enum: '{{ field }} é está com o tipo errado',
          exists: 'Atividade não encontrada ou não pertence a você'
        },
      })

      if (['comum', 'regional'].includes(usuario.role) && statusAtividade.indexOf(dadosTarefa.status) > 2) {
        return response.badRequest({ mensagem: 'Você não pode realizar essa ação', code: 'err_0026' })
      }

      await Tarefa.query().update({
        status: statusAtividade.indexOf(dadosTarefa.status)
      }).where({ id: dadosTarefa.idTarefa })

      return response.ok({ mensagem: 'Atividade atualizada com sucesso' })
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0027' })
      }

      return response.badRequest({ mensagem: 'Houve um erro ao atualizar atividade', code: 'err_0028' })
    }
  }

  public async cadastrarCampanha({ request, response }: HttpContextContract) {
    try {
      const dadosTarefa = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          slug: schema.string({}, [
            rules.unique({
              table: 'campanhas',
              column: 'slug',
              where: {
                tipo: request.input('tipo'),
                status: request.input('status')
              }
            }),
          ]),
          tipo: schema.enum(TiposCampanhaEnum),
          cargo_tarefa: schema.array().members(schema.enum(cargosEnum)),
          status: schema.boolean(),
        }),
        messages: {
          required: '{{ field }} é obrigatório',
          enum: '{{ field }} tipo inválido',
          'slug.unique': 'Atividade já cadastrada'
        },
      })

      await Campanha.updateOrCreate({
        slug: request.input('slug'),
        status: !request.input('status'),
      }, dadosTarefa)

      return response.ok({ mensagem: 'Ação realizada com sucesso' })
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0029' })
      }

      return response.badRequest({ mensagem: 'Houve um erro ao cadastar nova campanha', code: 'err_0030' })
    }
  }

}
