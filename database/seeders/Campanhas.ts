import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Campanha from 'App/Models/Campanha'

export default class CampanhasSeeder extends BaseSeeder {
  public async run () {
    await Campanha.updateOrCreateMany('slug', [{
      nome: 'Cerimônia Magna de Iniciação',
      slug: 'iniciacao',
      tipo: 'cnie',
      status: 1,
    }, {
      nome: 'Cerimônia Magna de Elevação',
      slug: 'elevacao',
      tipo: 'cnie',
      status: 1,
    }, {
      nome: 'Arrecação de Fundos',
      slug: 'arrecadacao-fundos',
      tipo: 'cnie',
      status: 1,
    }, {
      nome: 'Relatório DeMolays ativos e Consultores',
      slug: 'relatorio-dms-ativos-consultores',
      tipo: 'caneta-ouro',
      status: 1,
    }, {
      nome: 'Relatório semestral tesouraria',
      slug: 'relatorio-semestral-tesouraria',
      tipo: 'tesoureiro-ouro',
      status: 1,
    }])
  }
}
