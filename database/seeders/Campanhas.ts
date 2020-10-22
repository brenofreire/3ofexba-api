import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Campanha from 'App/Models/Campanha'

export default class CampanhasSeeder extends BaseSeeder {
  public async run () {
    await Campanha.updateOrCreateMany('slug', [{
      nome: 'Cerimônia Magna de Iniciação',
      slug: 'iniciacao',
      tipo: 'cnie',
      status: true,
      cargo_tarefa: 'mc',
    }, {
      nome: 'Cerimônia Magna de Elevação',
      slug: 'elevacao',
      tipo: 'cnie',
      status: true,
      cargo_tarefa: 'mc',
    }, {
      nome: 'Arrecação de Fundos',
      slug: 'arrecadacao-fundos',
      tipo: 'cnie',
      status: true,
      cargo_tarefa: 'mc',
    }, {
      nome: 'Relatório DeMolays ativos e Consultores',
      slug: 'relatorio-dms-ativos-consultores',
      tipo: 'caneta-de-ouro',
      status: true,
      cargo_tarefa: 'esc',
    }, {
      nome: 'Relatório semestral tesouraria',
      slug: 'relatorio-semestral-tesouraria',
      tipo: 'tesoureiro-de-ouro',
      status: true,
      cargo_tarefa: 'tes',
    }])
  }
}
