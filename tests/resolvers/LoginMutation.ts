import { sign } from 'jsonwebtoken'

import type { IContext, ICustomFieldResolver } from '../../src'
import { knex } from '../knex'

// TODO: we should generate this type def from schema automatically
interface LoginMutationArgs {
  userId: string
  password: string
}

// TODO: This type def is very verbose
export const LoginMutation: ICustomFieldResolver<
  {},
  IContext,
  LoginMutationArgs
> = {
  name: 'LoginMutation',
  resolve: async (_root, args) => {
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
  },
}
