import vine from '@vinejs/vine'

export const credentials = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim(),
  })
)
