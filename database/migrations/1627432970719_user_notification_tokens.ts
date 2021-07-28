import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UserNotificationTokens extends BaseSchema {
  protected tableName = 'user_notification_tokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('userId')
      table.string('token')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
