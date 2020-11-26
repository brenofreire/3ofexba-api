import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Capitulo from 'App/Models/Capitulo'

export default class CapituloSeeder extends BaseSeeder {
  public async run () {
    await Capitulo.updateOrCreateMany('numero', [{
      nome: 'Capítulo Conquistense',
      numero: 99,
      ofex: 3,
      sigla: 'CCOD',
    }, {
      nome: 'Capítulo Guardiões do Cruzeiro do Sul',
      numero: 772,
      ofex: 3,
      sigla: 'CGCS',
    }])
  }
}
