import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Usuario from 'App/Models/Usuario'

export default class UsuariosAdminSeeder extends BaseSeeder {
  public async run() {
    await Usuario.updateOrCreateMany('idDemolay', [{
      email: 'breno.loorran@gmail.com',
      password: '123123123',
      capitulo: 99,
      role: 'admin',
      status: 1,
      idDemolay: 38938,
    }, {
      email: 'email@teste.com',
      password: '123123123',
      capitulo: 99,
      role: 'comum',
      status: 1,
      idDemolay: 1,
      cargo: 'mc',
    }, {
      email: 'email2@teste.com',
      password: '123123123',
      capitulo: 99,
      role: 'comum',
      status: 1,
      idDemolay: 2,
      cargo: 'esc',
    }, {
      email: 'email3@teste.com',
      password: '123123123',
      capitulo: 772,
      role: 'comum',
      status: 1,
      idDemolay: 3,
      cargo: 'mc',
    }])
  }
}
