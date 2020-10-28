import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Usuarios extends BaseSchema {
  protected tableName = 'usuarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nome').notNullable()
      table.integer('id_demolay').unique().notNullable()
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.integer('capitulo').notNullable()
      table.string('role').notNullable()
      table.string('status').notNullable()
      table.string('cargo')

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
