import User from '#models/user'
import { faker } from '@faker-js/faker'
import { test } from '@japa/runner'

test.group('[POST] /posts', (group) => {
  let user: User

  group.setup(async () => {
    user = await User.create({
      email: faker.internet.email(),
      password: faker.internet.password(),
      fullName: faker.person.fullName(),
      username: faker.internet.username(),
    })
  })

  test('unauthenticated user', async ({ client }) => {
    const response = await client.post('/posts')
    response.assertUnauthorized()
  })

  test('no body in the request', async ({ client }) => {
    const response = await client.post('/posts').loginAs(user)
    response.assertUnprocessableEntity()
  })

  const invalidPayloads = [
    { description: 'empty Title', payload: { title: '', text: 'Some text' } },
    { description: 'undefined Text', payload: { title: 'Valid Title', text: undefined } },
    { description: 'numeric Title', payload: { title: 123, text: 'Some text' } },
  ]

  test('invalid request body with {description}')
    .with(invalidPayloads)
    .run(async ({ client }, { payload }) => {
      const response = await client.post('/posts').json(payload).loginAs(user)
      response.assertUnprocessableEntity()
    })

  test('success', async ({ client }) => {
    const response = await client
      .post('/posts')
      .json({ title: 'sample', text: 'Wed, 21 Oct 2015 18:27:50 GMT' })
      .loginAs(user)
    response.assertCreated()
  })
})
