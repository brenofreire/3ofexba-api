import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Usuarios extends BaseSchema {
  protected tableName = 'usuarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('id_demolay').unique()
      table.string('email').unique()
      table.string('password')
      table.integer('capitulo')
      table.string('role')
      table.string('status')

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
