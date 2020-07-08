/* eslint-disable no-unused-vars */
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'

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
    return new Promise(response => {
      const error = jwt.decode(token, Env.get('JWT_SECRET'), (err, decoded) => {
        return err ? null : decoded.data.user
      })
      return response({ ...error, error: 'jwt_expired_token' })
    })
  }
}
