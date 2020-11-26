import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Campanhas extends BaseSchema {
  protected tableName = 'campanhas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nome').notNullable()
      table.string('slug').index('slug_index_campanha').unique().notNullable()
      table.string('tipo').index('tipo_index_camapnha').notNullable()
      table.string('cargo_tarefa').notNullable()
      table.dateTime('data_entrega').notNullable()
      table.dateTime('data_final_semestre').notNullable()
      table.integer('status').notNullable()

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
