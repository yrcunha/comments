import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']

  async run() {
    await User.createMany([
      {
        email: 'virk@adonisjs.com',
        password: 'secret',
        fullName: 'Virk',
        username: 'Virk',
      },
      {
        email: 'romain@adonisjs.com',
        password: 'supersecret',
        fullName: 'Romain',
        username: 'Romain',
      },
    ])
  }
}
