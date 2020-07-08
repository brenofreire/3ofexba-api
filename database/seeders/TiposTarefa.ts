import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TiposTarefa from 'App/Models/TiposTarefa'

export default class TiposTarefaSeeder extends BaseSeeder {
  public async run () {
    await TiposTarefa.createMany([{
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
      nome: 'Relatório DeMolays ativos e Consultores',
      slug: 'relatorio-dms-ativos-consultores',
      tipo: 'caneta',
      status: 1,
    }, {
      nome: 'Relatório semestral tesouraria',
      slug: 'relatorio-semestral-tesouraria',
      tipo: 'caneta',
      status: 1,
    }])
  }
}
