import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Campanha from 'App/Models/Campanha'
import { statusAtividade, withExtras, statusAtividadeLabel, getRuleError, cargosEnum, lowerLike } from '../../../Utils/Utils'
import Tarefa from 'App/Models/Tarefa'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import TipoCampanhasController from './TipoCampanhasController'
import moment from 'moment'
import slugify from 'slugify'

export default class TarefasController {
  private tiposCampanhaCtrl = new TipoCampanhasController()
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
        lowerLikeNomeCampanha = termoBusca ? lowerLike('nome', termoBusca) : ''
      }

      const idCapitulo = validacaoResumo.capitulo || request.input('usuario').capitulo

      const campanhas = await Campanha.query()
        .select('tipo', 'cargo_tarefa')
        .count('id', 'quantidade')
        .groupBy('tipo', 'cargo_tarefa')
        .andWhere('data_final_semestre', '>', moment().format('YYYY-MM-DD HH:mm:ss'))

      const tarefasDoCapitulo = await Tarefa.query()
        .select('capitulo', 'tarefas.tipo_campanha', 'tipo_campanhas.nome')
        .count('tarefas.id', 'concluidas')
        .leftJoin('tipo_campanhas', 'tarefas.tipo_campanha', 'slug')
        .groupBy('tipo_campanha', 'tipo_campanhas.nome', 'capitulo')
        .where({
          capitulo: idCapitulo,
          status: statusAtividade.indexOf('atividade-aprovada'),
        })
        .whereRaw(lowerLikeNomeCampanha)

      if (!campanhas.length) {
        // throw ({ mensagem: 'Parece que ainda não tem atividades cadastradas no sistema', code: 'err_0010' })
        return []
      }

      const novoRetorno: any = []
      const TiposCampanhaEnumReverso = (await this.tiposCampanhaCtrl.getTipoCampanhas()).TiposCampanhaEnumReverso
      campanhas.map((campanha) => {
        const tarefaInfo = tarefasDoCapitulo.find((tarefa) => tarefa.tipo_campanha === campanha.tipo)
        novoRetorno.push({
          nome: TiposCampanhaEnumReverso[campanha.tipo],
          slug: campanha.tipo,
          concluidas: parseInt(tarefaInfo && tarefaInfo.concluidas) || 0,
          ativas: parseInt(campanha.quantidade),
          cargoTarefa: campanha.cargo_tarefa,
          idCapitulo,
        })
      })

      return response.ok(novoRetorno)
    } catch (error) {
      console.log(error)

      const [rule, field] = getRuleError(error)
      if (rule === 'required') {
        return response.badRequest({ mensagem: `${field} inválido`, code: 'err_0017' })
      } else if (error && error.mensagem) {
        return response.badRequest(error)
      } else {
        return response.badRequest({
          mensagem: 'Houve um erro ao listar atividades do capítulo',
          code: 'err_0011',
        })
      }
    }
  }

  public async getCampanhaDetalhada({ request, params, response }: HttpContextContract) {
    if (!params.tipoCampanha) {
      return response.badRequest({
        mensagem: 'Parâmetro [tipoCampanha] não informado',
        code: 'err_0012',
      })
    }

    try {
      const campanhas = withExtras(
        await Campanha.query()
          .select('*')
          .where({ tipo: params.tipoCampanha })
          .andWhere('data_final_semestre', '>', moment().format('YYYY-MM-DD HH:mm:ss'))
      )
      const tarefasDoCapitulo = withExtras(
        await Tarefa.query()
          .select('*')
          .where({
            capitulo: request.input('capitulo') || request.input('usuario').capitulo,
            tipoCampanha: params.tipoCampanha,
          })
      )

      if (!campanhas.length) {
        throw {
          mensagem: 'Parece que ainda não tem atividades cadastradas no sistema',
          code: 'err_0013',
        }
      }

      campanhas.map((campanha) => {
        const setTarefaNaoRealizada = () => {
          campanha.statusCapitulo = 0
          campanha.statusCapituloSlug = statusAtividade[0]
          campanha.statusCapituloLabel = statusAtividadeLabel[0]
          delete campanha.id
        }

        if (tarefasDoCapitulo && tarefasDoCapitulo.length) {
          tarefasDoCapitulo.find((tarefa) => {
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

      const TiposCampanhaEnumReverso = (await this.tiposCampanhaCtrl.getTipoCampanhas()).TiposCampanhaEnumReverso

      return response.ok({
        tituloTarefa: TiposCampanhaEnumReverso[params.tipoCampanha],
        tarefas: campanhas,
      })
    } catch (error) {
      if (error && error.mensagem) {
        return response.notFound(error)
      } else {
        return response.badRequest({
          mensagem: 'Houve um erro ao detalhar informações de campanha',
          code: 'err_0014',
        })
      }
    }
  }

  public async enviarTarefa({ request, response }: HttpContextContract) {
    const TiposCampanhaEnum = (await this.tiposCampanhaCtrl.getTipoCampanhas()).TiposCampanhaEnum
    try {
      const dadosTarefa = await request.validate({
        schema: schema.create({
          slugCampanha: schema.string(),
          tipoCampanha: schema.enum(TiposCampanhaEnum),
          status: schema.string.optional(),
        }),
        messages: {
          required: '{{ field }} é obrigatório',
          enum: '{{ field }} tipo inválido',
        },
      })

      const jaExisteTarefa = await Tarefa.query()
        .where({
          idDm: request.input('usuario').id,
          slugCampanha: dadosTarefa.slugCampanha,
          tipoCampanha: dadosTarefa.tipoCampanha,
        })
        .first()

      if (jaExisteTarefa) {
        return response.ok({ mensagem: 'Atividade já cadastrada' })
      } else {
        await Tarefa.create({
          slugCampanha: dadosTarefa.slugCampanha,
          tipoCampanha: dadosTarefa.tipoCampanha,
          capitulo: request.input('usuario').capitulo,
          idDm: request.input('usuario').id,
          status: statusAtividade.indexOf(request.input('status') || 'atividade-nao-formulada'),
        })

        return response.ok({ mensagem: 'Atividade enviada com sucesso' })
      }
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0024' })
      }

      return response.badRequest({
        mensagem: 'Houve um erro ao cadastar nova atividade',
        code: 'err_0020',
      })
    }
  }

  public async editarTarefa({ request, response }: HttpContextContract) {
    try {
      const usuario = request.input('usuario')
      const dadosTarefa = await request.validate({
        schema: schema.create({
          idTarefa: schema.number([
            rules.exists({
              column: 'id',
              table: 'tarefas',
              where: { id_demolay: usuario.id },
            }),
          ]),
          status: schema.enum(statusAtividade),
        }),
        messages: {
          required: '{{ field }} é obrigatório',
          enum: '{{ field }} é está com o tipo errado',
          exists: 'Atividade não encontrada ou não pertence a você',
        },
      })

      if (['comum', 'regional'].includes(usuario.role) && statusAtividade.indexOf(dadosTarefa.status) > 2) {
        return response.badRequest({
          mensagem: 'Você não pode realizar essa ação',
          code: 'err_0026',
        })
      }

      await Tarefa.query()
        .update({
          status: statusAtividade.indexOf(dadosTarefa.status),
        })
        .where({ id: dadosTarefa.idTarefa })

      return response.ok({ mensagem: 'Atividade atualizada com sucesso' })
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0027' })
      }

      return response.badRequest({
        mensagem: 'Houve um erro ao atualizar atividade',
        code: 'err_0028',
      })
    }
  }

  public async cadastrarCampanha({ request, response }: HttpContextContract) {
    const slugQueJaTem = request.input('slug')
    const statusQueJaTem = request.input('status')

    request.updateBody({
      ...request.all(),
      slug: !slugQueJaTem ? slugify(request.input('nome'), { lower: true }) : slugQueJaTem,
      status: typeof slugQueJaTem !== 'undefined' ? statusQueJaTem : 1,
    })

    try {
      const TiposCampanhaEnum = (await this.tiposCampanhaCtrl.getTipoCampanhas()).TiposCampanhaEnum
      const dadosTarefa = await request.validate({
        schema: schema.create({
          nome: schema.string(),
          slug: !request.input('id')
            ? schema.string({}, [
                rules.unique({
                  table: 'campanhas',
                  column: 'slug',
                }),
              ])
            : schema.string(),
          tipo: schema.enum(TiposCampanhaEnum),
          cargo_tarefa: schema.enum(cargosEnum),
          data_entrega: schema.date({ format: 'yyyy-LL-dd HH:mm:ss' }),
          data_final_semestre: schema.date({ format: 'yyyy-LL-dd HH:mm:ss' }),
          status: schema.number(),
        }),
        messages: {
          'required': '{{ field }} é obrigatório',
          'enum': '{{ field }} tipo inválido',
          'slug.unique': 'Atividade já cadastrada',
        },
      })

      await Campanha.updateOrCreate(
        {
          slug: request.input('slug'),
        },
        JSON.parse(JSON.stringify(dadosTarefa))
      )

      return response.ok({ mensagem: 'Ação realizada com sucesso' })
    } catch (error) {
      if (error && error.messages && error.messages.errors) {
        return response.badRequest({ mensagem: error.messages.errors[0].message, code: 'err_0038' })
      }

      return response.badRequest({
        mensagem: 'Houve um erro ao cadastar nova campanha',
        code: 'err_0030',
      })
    }
  }

  async getTiposCampanha({ response }: HttpContextContract) {
    const tipos = await this.tiposCampanhaCtrl.getTipoCampanhas()

    return response.ok(tipos.TiposCampanhaEnumReverso)
  }
}
