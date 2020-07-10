/* eslint-disable no-unused-vars */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'
import UsuariosMeta from 'App/Models/UsuariosMeta'
import { gerarTokenJWT } from 'App/Utils/Utils'

export default class AuthUser {
  public async handle ({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const token = request.headers().authorization ? request.headers().authorization?.replace(/Bearer /, '') : ''

    if (!token) {
      return response.forbidden({ mensagem: 'jwt_auth_empty_token' })
    }

    const user: any = await this.validaToken(token)

    if (!user) {
      return response.forbidden({ code: 'jwt_auth_invalid_token', mensagem: 'Token JWT inválido' })
    } else if (user.error === 'jwt_expired_token') {
      try {
        return response.forbidden(user)
      } catch (error) {
        return response.forbidden(error)
      }
    } else if(user.error === 'jwt_expired_token_refreshed') {
      return response.badRequest(user)
    }

    const role = user.role || ''
    user.ID = user.id
    request.updateBody({ ...{ usuario: user, ...{ role } }, ...request.all() })
    return await next()
  }

  private async validaToken (token) {
    return new Promise((response) => {
      jwt.verify(token, Env.get('JWT_SECRET'), async (err, decoded) => {
        if (err && err.name === 'TokenExpiredError') {
          return response(await this.decodificaTokenExpirado(token))
        } else if (err) {
          return response(null)
        }
        return response(decoded.data.usuario)
      })
    })
  }

  private decodificaTokenExpirado (token) {
    return new Promise(async response => {
      const dados = jwt.decode(token, Env.get('JWT_SECRET'), (err, decoded) => {
        return err ? null : decoded.data.user
      })

      const mudouSenha = await UsuariosMeta.query()
        .where({meta_key: 'mudou-senha'})
        .andWhere('meta_value', '>', dados.iat * 1000).first()

      if(mudouSenha) {
        return response({ error: 'jwt_expired_token' })
      } else {
        return response({
          error: 'jwt_expired_token_refreshed',
          token: gerarTokenJWT(dados.data.usuario),
          code: 'err_0015',
        })
      }
    })
  }
}
