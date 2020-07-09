import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { TiposCampanha } from 'App/Utils/Utils'

export default class Tarefa extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slugCampanha: string

  @column()
  public tipoCampanha: TiposCampanha

  @column()
  public idDemolay: number

  @column()
  public capitulo: number

  @column()
  public status: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
