import Post from '#models/post'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[GET] /posts/{{postId}}/comments', (group) => {
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
    const response = await client.get('/posts/1/comments')
    response.assertUnauthorized()
  })

  test('invalid parameters for postId', async ({ client }) => {
    const response = await client.get('/posts/A/comments').loginAs(user)
    response.assertUnprocessableEntity()
  })

  test('invalid parameters for pagination', async ({ client }) => {
    const response = await client.get('/posts/1/comments?page=A').loginAs(user)
    response.assertUnprocessableEntity()
  })

  test('success sending pagination', async ({ assert, client }) => {
    const response = await client.get(`/posts/${post.id}/comments?page=2&limit=2`).loginAs(user)
    response.assertOk()

    const body = response.body()
    assert.equal(body.meta.perPage, 2, 'The limit per page should be 2')
    assert.equal(body.meta.currentPage, 2, 'Current page should be 2')
  })

  test('success with default pagination', async ({ assert, client }) => {
    const response = await client.get(`/posts/${post.id}/comments`).loginAs(user)
    response.assertOk()

    const body = response.body()
    assert.equal(body.meta.perPage, 10, 'The limit per page should be 10')
    assert.equal(body.meta.currentPage, 1, 'Current page should be 1')
  })
})
