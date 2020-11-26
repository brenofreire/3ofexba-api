import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthRegional {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const usuario = ctx.request.input('usuario')
    if(usuario.role === 'admin' || usuario.role === 'regional') {
      await next()
    } else {
      return ctx.response.forbidden({
        mensagem: 'Você não tem permissão pra realizar essa ação',
        code: 'err_0023',
      })
    }
  }
}
