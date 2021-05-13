import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Tarefa from 'App/Models/Tarefa'
import { statusAtividade } from 'App/Utils/Utils'

export default class TarefasSeeder extends BaseSeeder {
  public async run() {
    await Tarefa.createMany([
      {
        capitulo: 40,
        tipoCampanha: 'caneta-ouro',
        slugCampanha: 'convite-1',
        status: statusAtividade.indexOf('atividade-aprovada'),
        idDm: 4,
      },
      {
        capitulo: 99,
        tipoCampanha: 'cnie',
        slugCampanha: 'elevacao',
        status: statusAtividade.indexOf('atividade-aprovada'),
        idDm: 2,
      },
      {
        capitulo: 99,
        tipoCampanha: 'cnie',
        slugCampanha: 'iniciacao',
        status: statusAtividade.indexOf('atividade-aprovada'),
        idDm: 2,
      },
      {
        capitulo: 772,
        tipoCampanha: 'cnie',
        slugCampanha: 'iniciacao',
        status: statusAtividade.indexOf('atividade-aprovada'),
        idDm: 3,
      },
    ])
  }
}
