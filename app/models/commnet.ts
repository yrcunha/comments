import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import db from '@adonisjs/lucid/services/db'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export type CommentStatus = 'pending' | 'approved' | 'rejected'

export default class Comment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'post_id', serializeAs: null })
  declare postId: number

  @column({ columnName: 'author_id' })
  declare authorId: number

  @column()
  declare text: string

  @column({ columnName: 'parent_id', serializeAs: null })
  declare parentId: number | null

  @belongsTo(() => Comment, { foreignKey: 'parentId' })
  declare parent: BelongsTo<typeof Comment>

  @hasMany(() => Comment, { foreignKey: 'parentId' })
  declare replies: HasMany<typeof Comment>

  @column({ serializeAs: null })
  declare status: CommentStatus

  @column.dateTime({ columnName: 'created_at', autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({
    columnName: 'updated_at',
    autoCreate: true,
    autoUpdate: true,
    serializeAs: 'lastUpdate',
  })
  declare updatedAt: DateTime | null

  @column({ serializeAs: null })
  declare deleted: boolean

  async softDeleteRecursively() {
    await await db.rawQuery(
      `
      WITH RECURSIVE replies AS (
        SELECT id FROM comments WHERE id = ?
        UNION ALL
        SELECT c.id
        FROM comments c
        INNER JOIN replies d ON c.parent_id = d.id
      )
      UPDATE comments
      SET deleted = true
      WHERE id IN (SELECT id FROM replies)
    `,
      [this.id]
    )
  }
}
