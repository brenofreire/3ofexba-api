import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Capitulos extends BaseSchema {
  protected tableName = 'capitulos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nome').notNullable()
      table.integer('numero').unique().notNullable()
      table.string('sigla').notNullable()
      table.integer('ofex').notNullable()

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
