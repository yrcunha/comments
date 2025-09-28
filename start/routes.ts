/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

// import CommentsController from '#controllers/comments_controller'
const CommentsController = () => import('#controllers/comments_controller')
const PostsController = () => import('#controllers/posts_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const AuthController = () => import('#controllers/auth_controller')

router.post('/login', [AuthController, 'login'])

router
  .group(() => {
    router.post('/posts', [PostsController, 'create'])
    router.get('/posts', [PostsController, 'all'])

    router.post('/posts/:postId/comments', [CommentsController, 'create'])
    router.get('/posts/:postId/comments', [CommentsController, 'all'])
    router.get('/posts/:postId/comments/pending', [CommentsController, 'pendings'])

    router.put('/comments/:commentId', [CommentsController, 'update'])
    router.delete('/comments/:commentId', [CommentsController, 'delete'])
    router.patch('/comments/:commentId/approval', [CommentsController, 'changeStatus'])
    router.get('/comments/:commentId/replies', [CommentsController, 'replies'])
  })
  .use(middleware.auth({ guards: ['api'] }))
