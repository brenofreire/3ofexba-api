/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes/index.ts` as follows
|
| import './cart'
| import './customer'
|
*/

import HealthCheck from '@ioc:Adonis/Core/HealthCheck'
import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('cadastro', 'Controllers/UsuariosController.cadastro')
  Route.post('login', 'Controllers/UsuariosController.login')

  Route.group(() => {
    Route.get('tipos', 'Controllers/TarefasController.getTiposCampanha')
    Route.group(() => {
      Route.get(':tipoCampanha', 'Controllers/TarefasController.getCampanhaDetalhada')
      Route.get('', 'Controllers/TarefasController.getResumoCampanhas')
    }).middleware(['authUser'])
  }).prefix('campanhas')

  Route.group(() => {
    Route.post('', 'Controllers/TarefasController.enviarTarefa')
    Route.post('editar', 'Controllers/TarefasController.editarTarefa')
  })
    .middleware(['authUser'])
    .prefix('tarefas')

  Route.group(() => {
    Route.group(() => {
      Route.post('', 'Controllers/AgostinhoController.enviarMensagem')
    }).middleware(['authAdmin'])

    Route.get('', 'Controllers/AgostinhoController.getMensagens')
  })
    .middleware(['authUser'])
    .prefix('agostinho')

  Route.group(() => {
    Route.post('todos', 'Controllers/CapitulosController.buscarTodosCapitulos')
    Route.get('', 'Controllers/CapitulosController.buscarCapitulo').middleware('authRegional')
    Route.post('', 'Controllers/CapitulosController.cadastrarEditarCapitulo').middleware('authAdmin')
    Route.post('deletar', 'Controllers/CapitulosController.deletarCapitulo').middleware('authAdmin')
  })
    .middleware(['authUser'])
    .prefix('capitulos')

  Route.group(() => {
    Route.get('regioes', 'Controllers/CapitulosController.getRegioes')

    Route.get('usuarios', 'Controllers/UsuariosController.getUsuariosAdmin').middleware('authAdmin')
    Route.post('usuarios', 'Controllers/UsuariosController.mudarStatusUsuario')

    Route.get('campanhas', 'Controllers/CapitulosController.getCampanhasAdmin')
    Route.post('campanhas', 'Controllers/TarefasController.cadastrarCampanha').middleware('authAdmin')

    Route.get('cargos', 'Controllers/CargosController.getCargos').middleware('authAdmin')
    Route.post('cargos', 'Controllers/CargosController.setCargos').middleware('authAdmin')
  })
    .middleware(['authUser', 'authRegional'])
    .prefix('admin')
})

Route.get('health', async ({ response }) => {
  const report = await HealthCheck.getReport()

  return report.healthy ? response.ok(report) : response.badRequest(report)
})
