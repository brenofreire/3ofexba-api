import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, beforeUpdate } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import { Cargos } from 'App/Utils/Utils'

export default class Usuario extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idDemolay: number

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public capitulo: number

  @column()
  public cargo: Cargos

  @column()
  public role: string

  @column()
  public status: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeUpdate()
  @beforeSave()
  public static async hashPassword (user: Usuario) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
