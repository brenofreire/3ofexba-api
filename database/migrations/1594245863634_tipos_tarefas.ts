import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class TiposTarefas extends BaseSchema {
  protected tableName = 'tipos_tarefas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nome')
      table.string('slug').index('slug_tipo_tarefas')
      table.string('tipo').index('tipo_tarefas')
      table.integer('status')

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
