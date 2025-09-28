import Post from '#models/post'
import { createPost, queryPosts } from '#validators/post_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createPost)
    const model = await Post.create({
      authorId: auth.user!.id,
      title: payload.title,
      text: payload.text,
    })
    return response.created(model)
  }

  async all({ request }: HttpContext) {
    const payload = await request.validateUsing(queryPosts)
    const page = payload.page || 1
    const limit = payload.limit || 10

    return Post.query()
      .orderBy('updated_at', 'desc')
      .preload('comments', (comments) =>
        comments.whereNull('parentId').andWhere('status', 'approved').orderBy('created_at', 'desc')
      )
      .paginate(page, limit)
  }
}
