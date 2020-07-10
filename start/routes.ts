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

import Route from '@ioc:Adonis/Core/Route'

Route.group(() => {
  Route.post('cadastro', 'Controllers/UsuariosController.cadastro')
  Route.post('login', 'Controllers/UsuariosController.login')

  Route.group(() => {
    Route.post('mudar-status-usuario', 'Controllers/UsuariosController.mudarStatusUsuario')
  }).middleware(['authUser', 'authAdmin'])

  Route.group(() => {
    Route.get('/:tipoCampanha', 'Controllers/TarefasController.getCampanhaDetalhada')
    Route.get('', 'Controllers/TarefasController.getResumoCampanhas')
  }).middleware(['authUser']).prefix('campanhas')

  Route.group(() => {
    Route.post('', 'Controllers/TarefasController.enviarTarefa')
  }).middleware(['authUser']).prefix('tarefas')

  Route.group(() => {
    // Route.get('ofex', 'Controllers/CapitulosController.getCapitulosOfex')
    // Route.get('', 'Controllers/CapitulosController.buscarCapitulo')
    Route.post('', 'Controllers/CapitulosController.cadastrarEditarCapitulo').middleware('authAdmin')
  }).middleware(['authUser']).prefix('capitulos')
})
