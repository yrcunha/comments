import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Comment from './commnet.js'

export default class Post extends BaseModel {
  public static table = 'posts'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'author_id' })
  declare authorId: number

  @column()
  declare title: string

  @column()
  declare text: string

  @hasMany(() => Comment, { foreignKey: 'postId' })
  declare comments: HasMany<typeof Comment>

  @column.dateTime({ columnName: 'created_at', autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({
    columnName: 'updated_at',
    autoCreate: true,
    autoUpdate: true,
    serializeAs: 'lastUpdate',
  })
  declare updatedAt: DateTime | null
}
