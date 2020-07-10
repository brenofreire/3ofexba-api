import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Tarefa from 'App/Models/Tarefa'
import { statusAtividade } from 'App/Utils/Utils'

export default class TarefasSeeder extends BaseSeeder {
  public async run () {
    await Tarefa.createMany([{
      capitulo: 99,
      tipoCampanha: 'caneta-ouro',
      slugCampanha: 'relatorio-dms-ativos-consultores',
      status: statusAtividade.indexOf('atividade-aprovada'),
      idDemolay: 5,
    }, {
      capitulo: 99,
      tipoCampanha: 'cnie',
      slugCampanha: 'elevacao',
      status: statusAtividade.indexOf('atividade-aprovada'),
      idDemolay: 5,
    }, {
      capitulo: 99,
      tipoCampanha: 'cnie',
      slugCampanha: 'iniciacao',
      status: statusAtividade.indexOf('atividade-aprovada'),
      idDemolay: 4,
    }, {
      capitulo: 772,
      tipoCampanha: 'cnie',
      slugCampanha: 'iniciacao',
      status: statusAtividade.indexOf('atividade-aprovada'),
      idDemolay: 2,
    }])
  }
}
