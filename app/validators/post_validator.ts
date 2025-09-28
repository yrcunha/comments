import vine from '@vinejs/vine'

export const createPost = vine.compile(
  vine.object({
    title: vine.string().trim().maxLength(100),
    text: vine.string().trim().maxLength(1024),
  })
)

export const queryPosts = vine.compile(
  vine.object({
    page: vine.number().positive().withoutDecimals().optional(),
    limit: vine.number().positive().withoutDecimals().optional(),
  })
)
