import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave } from '@ioc:Adonis/Lucid/Orm'
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
  public cargo_tarefa: UserCargos[]

  @column()
  public status: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async cargoTarefaToArray (tarefa: Campanha) {
    tarefa.cargo_tarefa = <any> JSON.stringify(tarefa.cargo_tarefa)
  }
}
