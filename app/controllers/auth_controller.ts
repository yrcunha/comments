import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import env from '#start/env'
import { credentials } from '#validators/login_validator'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(credentials)
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: env.get('TOKEN_EXPIRES_IN'),
    })

    return response.ok({ type: 'Bearer', token: token.value?.release(), user: user.serialize() })
  }
}
