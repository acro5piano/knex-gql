import type { IContext, ICustomFieldResolver } from '../../framework'
import { knex } from '../knex'

interface Context extends IContext {
  userId: string
}

export const ViewerQuery: ICustomFieldResolver<{}, Context> = {
  name: 'ViewerQuery',
  resolve: async (_root, _args, ctx) => {
    return knex('users').where({ id: ctx.userId }).first()
  },
}
