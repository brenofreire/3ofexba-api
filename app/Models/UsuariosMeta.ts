import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class UsuariosMeta extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idUsuario: number

  @column()
  public metaValue: any

  @column()
  public metaKey: any
}
