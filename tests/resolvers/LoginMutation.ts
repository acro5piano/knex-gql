import { sign } from 'jsonwebtoken'

import { MutationResolvers } from '../__generated__/schema'
import { knex } from '../knex'

const loginMutationFn: MutationResolvers['login'] = async (_root, args) => {
  const user = await knex('users').where({ id: args.userId }).first()
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

// TODO: This type def is very verbose
export const LoginMutation = {
  name: 'LoginMutation',
  resolve: loginMutationFn,
}
