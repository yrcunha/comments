import Comment from '#models/commnet'
import Post from '#models/post'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[DELETE] /comments/{{commentId}}', (group) => {
  let user: User
  let post: Post

  group.setup(async () => {
    user = await User.create({
      email: faker.internet.email(),
      password: faker.internet.password(),
      fullName: faker.person.fullName(),
      username: faker.internet.username(),
    })
    post = await Post.create({
      authorId: user.id,
      title: faker.book.title(),
      text: faker.lorem.paragraph(),
    })
  })

  test('unauthenticated user', async ({ client }) => {
    const response = await client.delete('/comments/1')
    response.assertUnauthorized()
  })

  test('entity not found', async ({ client }) => {
    const response = await client.delete(`/comments/1`).json({ status: 'approved' }).loginAs(user)
    response.assertNotFound()
  })

  test('success', async ({ client }) => {
    const comment = await Comment.create({
      postId: post.id,
      authorId: user.id,
      text: faker.lorem.paragraph(),
      status: 'approved',
    })
    const response = await client.delete(`/comments/${comment.id}`).loginAs(user)
    response.assertNoContent()
  })
})
