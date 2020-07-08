import jwt from 'jsonwebtoken'

export const roles = ['comum', 'diretoria', 'admin']
export const statusUsuario = ['excluido', 'ativo', 'suspenso']

export const getRuleError = (error) => {
  return error.messages && error.messages.errors && [error.messages.errors[0].rule, error.messages.errors[0].field]
}

export const gerarTokenJWT = (params: { id, email, capitulo, role, status, password? }) => {
  if (params.password) {
    delete params.password
  }

  const body = {
    sub: params.id,
    data: { usuario: params },
  }

  const chaveSecreta = process.env.JWT_SECRET
  const horasExpiracao = (horas) => horas * 60 * 60
  const token = jwt.sign(body, chaveSecreta, { expiresIn: horasExpiracao(24) })

  return token
}

export const withExtras = (objeto) => {
  if (Array.isArray(objeto)) {
    return objeto.map((item) => {
      return { ...JSON.parse(JSON.stringify(item)), ...item?.extras }
    })
  }
  return { ...JSON.parse(JSON.stringify(objeto)), ...objeto?.extras }
}
