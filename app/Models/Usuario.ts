import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, beforeUpdate, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import { UserCargos, UserRoles } from 'App/Utils/Utils'
import Capitulo from './Capitulo'

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
  public cargo: UserCargos

  @column()
  public role: UserRoles

  @column()
  public status: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
  
  @belongsTo(() => Capitulo, {
    localKey: 'numero',
    foreignKey: 'capitulo',
  })
  public capituloInfo: BelongsTo<typeof Capitulo>

  @beforeUpdate()
  @beforeSave()
  public static async hashPassword (user: Usuario) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
