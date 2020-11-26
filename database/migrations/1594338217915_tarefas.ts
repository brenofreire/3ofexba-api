import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tarefas extends BaseSchema {
  protected tableName = 'tarefas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('slug_campanha').notNullable()
      table.string('tipo_campanha').notNullable()
      table.integer('id_demolay').index('id_usuario_tarefas').notNullable()
      table.integer('capitulo').notNullable()
      table.integer('status').notNullable()

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
