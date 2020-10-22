import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TipoCampanhas extends BaseSchema {
  protected tableName = 'tipo_campanhas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome')
      table.string('slug')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
