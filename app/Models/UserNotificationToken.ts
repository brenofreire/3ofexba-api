import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class UserNotificationToken extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public token: number
}
