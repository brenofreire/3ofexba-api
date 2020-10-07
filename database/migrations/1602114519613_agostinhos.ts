import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Agostinhos extends BaseSchema {
  protected tableName = 'agostinhos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('mensagem').notNullable()
      table.string('destinatarios').index('destinatarios_index').notNullable()
      table.string('remetente').index('remetente_index').notNullable()

      table.dateTime('created_at')
      table.dateTime('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
