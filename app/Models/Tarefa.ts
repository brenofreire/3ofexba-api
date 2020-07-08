import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Tarefa extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idTipoTarefa: number

  @column()
  public idUsuario: number

  @column()
  public capitulo: number

  @column()
  public status: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
