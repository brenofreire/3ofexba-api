import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Campanhas extends BaseSchema {
  protected tableName = 'campanhas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nome')
      table.string('slug').index('slug_index_campanha').unique()
      table.string('tipo').index('tipo_index_camapnha')
      table.string('cargo_tarefa')
      table.integer('status')

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
