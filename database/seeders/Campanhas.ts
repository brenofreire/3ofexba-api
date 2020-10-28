import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Campanha from 'App/Models/Campanha'
import moment from 'moment'

export default class CampanhasSeeder extends BaseSeeder {
  public finalDoSemestre = moment().endOf('year').format('YYYY-MM-DD HH:mm:ss')
  public async run () {
    await Campanha.updateOrCreateMany('slug', [{
      nome: 'Cerimônia Magna de Iniciação',
      slug: 'iniciacao',
      tipo: 'cnie',
      status: true,
      cargo_tarefa: 'mc',
      data_entrega: this.finalDoSemestre,
      data_final_semestre: this.finalDoSemestre,
    }, {
      nome: 'Cerimônia Magna de Elevação',
      slug: 'elevacao',
      tipo: 'cnie',
      status: true,
      cargo_tarefa: 'mc',
      data_entrega: this.finalDoSemestre,
      data_final_semestre: this.finalDoSemestre,
    }, {
      nome: 'Arrecação de Fundos',
      slug: 'arrecadacao-fundos',
      tipo: 'cnie',
      status: true,
      cargo_tarefa: 'mc',
      data_entrega: this.finalDoSemestre,
      data_final_semestre: this.finalDoSemestre,
    }, {
      nome: 'Relatório DeMolays ativos e Consultores',
      slug: 'relatorio-dms-ativos-consultores',
      tipo: 'caneta-de-ouro',
      status: true,
      cargo_tarefa: 'esc',
      data_entrega: moment(moment().endOf('month')).format('YYYY-MM-DD HH:mm:ss'),
      data_final_semestre: this.finalDoSemestre,
    }, {
      nome: 'Relatório semestral tesouraria',
      slug: 'relatorio-semestral-tesouraria',
      tipo: 'tesoureiro-de-ouro',
      status: true,
      cargo_tarefa: 'tes',
      data_entrega: this.finalDoSemestre,
      data_final_semestre: this.finalDoSemestre,
    }])
  }
}
