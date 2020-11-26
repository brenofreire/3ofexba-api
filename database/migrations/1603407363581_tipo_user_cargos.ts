import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TipoUserCargos extends BaseSchema {
  protected tableName = 'tipo_user_cargos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome').notNullable
      table.string('slug').notNullable
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
