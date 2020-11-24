import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Cargo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nomeCargo: string

  @column()
  public slugCargo

  @column()
  public organizacao: number  
}
