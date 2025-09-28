import Post from '#models/post'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[POST] /posts/{{postId}}/comments', (group) => {
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
    const response = await client.post('/posts/1/comments')
    response.assertUnauthorized()
  })

  const invalidPayloads = [
    { description: 'empty Text', payload: { text: '', parentId: 9 } },
    { description: 'string ParentId', payload: { text: 'Valid Title', parentId: 'A' } },
    { description: 'numeric Text', payload: { text: 123, parentId: 9 } },
  ]

  test('invalid request body with {description}')
    .with(invalidPayloads)
    .run(async ({ client }, { payload }) => {
      const response = await client.post('/posts/1/comments').json(payload).loginAs(user)
      response.assertUnprocessableEntity()
    })

  test('invalid parameters for postId', async ({ client }) => {
    const response = await client.post('/posts/A/comments').loginAs(user)
    response.assertUnprocessableEntity()
  })

  test('Post not found', async ({ client }) => {
    const response = await client
      .post(`/posts/9999/comments`)
      .json({ text: 'Wed, 21 Oct 2015 18:27:50 GMT' })
      .loginAs(user)
    response.assertNotFound()
  })

  test('Parent not found', async ({ client }) => {
    const response = await client
      .post(`/posts/${post.id}/comments`)
      .json({ text: 'Wed, 21 Oct 2015 18:27:50 GMT', parentId: 999 })
      .loginAs(user)
    response.assertNotFound()
  })

  test('success', async ({ client }) => {
    const response = await client
      .post(`/posts/${post.id}/comments`)
      .json({ text: 'Wed, 21 Oct 2015 18:27:50 GMT' })
      .loginAs(user)
    response.assertCreated()
  })
})
