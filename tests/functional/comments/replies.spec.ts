import Comment from '#models/commnet'
import Post from '#models/post'
import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[GET] /comments/{{commentId}}/replies', (group) => {
  let user: User
  let post: Post
  let comment: Comment

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
    comment = await Comment.create({
      postId: post.id,
      authorId: user.id,
      text: faker.lorem.paragraph(),
      status: 'approved',
    })
  })

  test('unauthenticated user', async ({ client }) => {
    const response = await client.get('/comments/1/replies')
    response.assertUnauthorized()
  })

  test('invalid parameters for commentId', async ({ client }) => {
    const response = await client.get('/comments/A/replies?page=A').loginAs(user)
    response.assertUnprocessableEntity()
  })

  test('invalid parameters for pagination', async ({ client }) => {
    const response = await client.get('/comments/1/replies?page=A').loginAs(user)
    response.assertUnprocessableEntity()
  })

  test('success sending pagination', async ({ assert, client }) => {
    const response = await client
      .get(`/comments/${comment.id}/replies?page=2&limit=2`)
      .loginAs(user)
    response.assertOk()

    const body = response.body()
    assert.equal(body.meta.total, 0, 'The total should be 0')
    assert.equal(body.meta.perPage, 2, 'The limit per page should be 2')
    assert.equal(body.meta.currentPage, 2, 'Current page should be 2')
  })

  test('success with default pagination', async ({ assert, client }) => {
    await Comment.create({
      postId: post.id,
      authorId: user.id,
      text: faker.lorem.paragraph(),
      parentId: comment.id,
      status: 'approved',
    })
    const response = await client.get(`/comments/${comment.id}/replies`).loginAs(user)
    response.assertOk()

    const body = response.body()
    assert.equal(body.meta.total, 1, 'The total should be 1')
    assert.equal(body.meta.perPage, 10, 'The limit per page should be 10')
    assert.equal(body.meta.currentPage, 1, 'Current page should be 1')
  })
})
