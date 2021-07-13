import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Cargos extends BaseSchema {
  protected tableName = 'cargos'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nomeCargo').notNullable()
      table.integer('slugCargo').unique().notNullable()
      table.string('organizacao').notNullable()

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
