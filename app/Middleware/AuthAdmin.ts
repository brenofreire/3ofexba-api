import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AuthAdmin {
  public async handle (ctx: HttpContextContract, next: () => Promise<void>) {
    const usuario = ctx.request.input('usuario')
    if(usuario.role === 'admin') {
      await next()
    } else {
      return ctx.response.forbidden({
        mensagem: 'Você não tem permissão pra realizar essa ação',
        code: 'err_0006',
      })
    }
  }
}
