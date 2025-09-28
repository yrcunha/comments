import Comment from '#models/commnet'
import Post from '#models/post'
import {
  changeCommentStatus,
  createComment,
  deleteComment,
  queryComments,
  queryReplies,
  updateComment,
} from '#validators/comment_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createComment)

    const post = await Post.find(payload.params.postId)
    if (!post?.id) return response.notFound({ message: 'Post not found' })

    if (payload.parentId) {
      const parent = await Comment.find(payload.parentId)
      if (!parent?.id) return response.notFound({ message: 'Parent comment not found' })
    }

    const model = await Comment.create({
      postId: post.id,
      authorId: auth.user!.id,
      text: payload.text,
      parentId: payload.parentId,
    })
    return response.created(model)
  }

  async all({ request }: HttpContext) {
    const payload = await request.validateUsing(queryComments)
    const page = payload.page || 1
    const limit = payload.limit || 10

    return Comment.query()
      .orderBy('created_at', 'desc')
      .where('postId', payload.params.postId)
      .andWhere('status', 'approved')
      .andWhereNull('parentId')
      .preload('replies', (replies) =>
        replies.where('status', 'approved').orderBy('created_at', 'desc')
      )
      .paginate(page, limit)
  }

  async pendings({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(queryComments)
    const page = payload.page || 1
    const limit = payload.limit || 10

    return Comment.query()
      .orderBy('created_at', 'desc')
      .where('postId', payload.params.postId)
      .andWhere('status', 'pending')
      .andWhere('authorId', auth.user!.id)
      .preload('parent')
      .paginate(page, limit)
  }

  async update({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(updateComment)

    const [comment] = await Comment.query()
      .where('id', payload.params.commentId)
      .andWhere('authorId', auth.user!.id)
    if (!comment?.id) return response.notFound({ message: 'Comment not found' })

    comment.text = payload.text
    comment.status = 'pending'
    await comment.save()
    return response.noContent()
  }

  async delete({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(deleteComment)

    const [comment] = await Comment.query()
      .where('id', payload.params.commentId)
      .andWhere('authorId', auth.user!.id)
    if (!comment?.id) return response.notFound({ message: 'Comment not found' })

    await comment.delete()
    return response.noContent()
  }

  async changeStatus({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(changeCommentStatus)

    const [comment] = await Comment.query()
      .where('id', payload.params.commentId)
      .andWhere('authorId', auth.user!.id)
    if (!comment?.id) return response.notFound({ message: 'Comment not found' })

    comment.status = payload.status
    await comment.save()
    return response.noContent()
  }

  async replies({ request }: HttpContext) {
    const payload = await request.validateUsing(queryReplies)
    const page = payload.page || 1
    const limit = payload.limit || 10

    return Comment.query()
      .orderBy('created_at', 'desc')
      .where('parentId', payload.params.commentId)
      .andWhere('status', 'approved')
      .preload('replies', (replies) =>
        replies.andWhere('status', 'approved').orderBy('created_at', 'desc')
      )
      .paginate(page, limit)
  }
}
