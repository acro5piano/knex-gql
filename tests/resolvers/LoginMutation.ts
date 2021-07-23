import { sign } from 'jsonwebtoken'

import { MutationResolvers } from '../__generated__/schema'
import { users } from '../db'

export const LoginMutation: MutationResolvers['login'] = async (
  _root,
  args,
) => {
  const user = await users().where({ id: args.userId }).first()
  if (!user) {
    throw new Error(`no such user: ${args.userId}`)
  }

  return {
    token: sign(
      {
        userId: user.id,
      },
      'test',
    ),
    user,
  }
}
