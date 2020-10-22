import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import TipoCampanha from 'App/Models/TipoCampanha'

export default class TipoCampanhaSeeder extends BaseSeeder {
  public async run () {
    await TipoCampanha.createMany([{
      nome: 'CNIE',
      slug: 'cnie',
    }, {
      nome: 'Caneta de Ouro',
      slug: 'caneta-de-ouro',
    }, {
      nome: 'Tesoureiro de Ouro',
      slug: 'tesoureiro-de-ouro'
    }, {
      nome: 'Hospitaleiro de Ouro',
      slug: 'hospitaleiro-de-ouro',
    }])
  }
}
