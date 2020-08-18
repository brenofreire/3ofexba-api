import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UsuariosMetas extends BaseSchema {
  protected tableName = 'usuarios_metas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('id_usuario').notNullable()
      table.string('meta_key').notNullable()
      table.text('meta_value').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
