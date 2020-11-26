import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { UserCargos } from '../Utils/Utils'

export default class Campanha extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public slug: string

  @column()
  public tipo

  @column()
  public cargo_tarefa: UserCargos

  @column()
  public data_entrega: string | DateTime
  
  @column()
  public data_final_semestre: string | DateTime

  @column()
  public status: boolean | 0 | 1 

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
