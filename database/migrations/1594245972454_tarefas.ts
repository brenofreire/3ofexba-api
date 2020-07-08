import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Tarefas extends BaseSchema {
  protected tableName = 'tarefas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('id_tipo_tarefa')
      table.integer('id_usuario').index('id_usuario_tarefas')
      table.integer('capitulo')
      table.integer('status')

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
