import vine from '@vinejs/vine'

export const createComment = vine.compile(
  vine.object({
    parentId: vine.number().withoutDecimals().positive().optional(),
    text: vine.string().trim().maxLength(1024),
    params: vine.object({ postId: vine.number().withoutDecimals().positive() }),
  })
)

export const queryComments = vine.compile(
  vine.object({
    page: vine.number().positive().withoutDecimals().optional(),
    limit: vine.number().positive().withoutDecimals().optional(),
    params: vine.object({ postId: vine.number().withoutDecimals().positive() }),
  })
)

export const updateComment = vine.compile(
  vine.object({
    text: vine.string().trim().maxLength(1024),
    params: vine.object({ commentId: vine.number().withoutDecimals().positive() }),
  })
)

export const deleteComment = vine.compile(
  vine.object({ params: vine.object({ commentId: vine.number().withoutDecimals().positive() }) })
)

export const changeCommentStatus = vine.compile(
  vine.object({
    status: vine.enum(['approved', 'rejected']),
    params: vine.object({ commentId: vine.number().withoutDecimals().positive() }),
  })
)

export const queryReplies = vine.compile(
  vine.object({
    page: vine.number().positive().withoutDecimals().optional(),
    limit: vine.number().positive().withoutDecimals().optional(),
    params: vine.object({ commentId: vine.number().withoutDecimals().positive() }),
  })
)
