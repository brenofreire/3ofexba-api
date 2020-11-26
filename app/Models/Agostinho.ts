import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import { UserCargos } from 'App/Utils/Utils'

export default class Agostinho extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public mensagem: number

  @column()
  public destinatarios: UserCargos[]

  @column()
  public remetente: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
