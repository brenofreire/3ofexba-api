import jwt from 'jsonwebtoken'

export const statusUsuario = ['excluido', 'ativo', 'suspenso', 'pendente']

type StatusAvidadesInterface =
  | 'atividade-nao-formulada'
  | 'atividade-realizada'
  | 'atividade-enviada'
  | 'atividade-devolvida'
  | 'atividade-recusada'
  | 'atividade-aprovada'
export const statusAtividade: StatusAvidadesInterface[] = [
  'atividade-nao-formulada',
  'atividade-realizada',
  'atividade-enviada',
  'atividade-devolvida',
  'atividade-recusada',
  'atividade-aprovada',
]
export const statusAtividadeLabel = [
  'Atividade não formulada',
  'Atividade realizada',
  'Atividade enviada',
  'Atividade devolvida',
  'Atividade recusada',
  'Atividade aprovada',
]

export type UserCargos = 'mc' | 'esc' | 'tes' | 'hos' // MODEL
export const cargosEnum: UserCargos[] = ['mc', 'esc', 'tes', 'hos'] // MODEL
export const cargosEnumObj = {
  mc: 'Mestre Conselheiro',
  esc: 'Escrivão',
  hos: 'Hospitaleiro',
  tes: 'Tesoureiro',
}

export type UserRoles = 'admin' | 'regional' | 'comum'
export const rolesEnum: UserRoles[] = ['admin', 'regional', 'comum']

export const getRuleError = (error) => {
  return error.messages && error.messages.errors && [error.messages.errors[0].rule, error.messages.errors[0].field]
}

export const gerarTokenJWT = (params: { id; email; capitulo; role; status; password? }) => {
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

export const parsearArrayStringfadoNoArrayOuObjeto = (valor) => {
  valor = withExtras(valor)

  if (!Array.isArray(valor)) {
    valor = [valor]
  }

  for (const chave in valor) {
    for (const key in valor[chave]) {
      try {
        valor[chave][key] = JSON.parse(valor[chave][key])
      } catch (error) {
        valor[chave][key] = valor[chave][key]
      }
    }
  }

  return valor
}

export const lowerLike = (coluna, valor, engine?: 'mysql' | 'pg') => {
  if (engine && engine === 'mysql') {
    return `lower(${coluna}) LIKE lower('%${valor}%')`
  }
  return `cast(${coluna} AS TEXT) ILIKE '%${valor}%'`
}

const crypto = require('crypto')
const mykey = crypto.createCipher('aes-128-cbc', process.env.JWT_SECRET)

export const cryptPassword = (password, callback) => {
  let mystr = mykey.update(password, 'utf8', 'hex')
  mystr += mykey.final('hex')

  callback(null, mystr)
}

export const comparePassword = (hashword, password, callback) => {
  cryptPassword(password, (_, passwordEnteredHashed) => {
    callback(null, passwordEnteredHashed === hashword)
  })
}
