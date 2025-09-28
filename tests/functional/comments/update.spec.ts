import Comment from '#models/commnet'
import Post from '#models/post'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[PUT] /comments/{{commentId}}', (group) => {
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
    const response = await client.put('/comments/1')
    response.assertUnauthorized()
  })

  const invalidPayloads = [
    { description: 'empty Text', payload: { text: '' } },
    { description: 'undefined Text', payload: { text: undefined } },
    { description: 'numeric Text', payload: { text: 123 } },
  ]

  test('invalid request body with {description}')
    .with(invalidPayloads)
    .run(async ({ client }, { payload }) => {
      const response = await client.put('/comments/1').json(payload).loginAs(user)
      response.assertUnprocessableEntity()
    })

  test('entity not found', async ({ client }) => {
    const response = await client.put(`/comments/1`).json({ text: 'sample no noooo' }).loginAs(user)
    response.assertNotFound()
  })

  test('success', async ({ assert, client }) => {
    const comment = await Comment.create({
      postId: post.id,
      authorId: user.id,
      text: faker.lorem.paragraph(),
      status: 'approved',
    })
    const response = await client
      .put(`/comments/${comment.id}`)
      .json({ text: 'sample no noooo' })
      .loginAs(user)
    response.assertNoContent()

    const model = await Comment.find(comment.id)
    assert.equal(
      model!.status,
      'pending',
      'must change the status of the comment to prevent anyone from circumventing the approval system'
    )
  })
})
