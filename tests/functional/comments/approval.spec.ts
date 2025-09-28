import Comment from '#models/commnet'
import Post from '#models/post'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[PATCH] /comments/{{commentId}}/approval', (group) => {
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
    const response = await client.patch('/comments/1/approval')
    response.assertUnauthorized()
  })

  const invalidPayloads = [
    { description: 'empty Status', payload: { status: '' } },
    { description: 'undefined Status', payload: { status: undefined } },
    { description: 'numeric Status', payload: { status: 123 } },
  ]

  test('invalid request body with {description}')
    .with(invalidPayloads)
    .run(async ({ client }, { payload }) => {
      const response = await client.patch('/comments/1/approval').json(payload).loginAs(user)
      response.assertUnprocessableEntity()
    })

  test('entity not found', async ({ client }) => {
    const response = await client
      .patch(`/comments/1/approval`)
      .json({ status: 'approved' })
      .loginAs(user)
    response.assertNotFound()
  })

  test('success', async ({ client }) => {
    const comment = await Comment.create({
      postId: post.id,
      authorId: user.id,
      text: faker.lorem.paragraph(),
      status: 'approved',
    })
    const response = await client
      .patch(`/comments/${comment.id}/approval`)
      .json({ status: 'approved' })
      .loginAs(user)
    response.assertNoContent()
  })
})
