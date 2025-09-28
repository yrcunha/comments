import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('post_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('posts')
        .onDelete('CASCADE')

      table
        .integer('author_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('NO ACTION')

      table.text('text').notNullable()

      table
        .integer('parent_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable(this.tableName)
        .onDelete('NO ACTION')

      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending')

      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())

      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.boolean('deleted').defaultTo(false)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
