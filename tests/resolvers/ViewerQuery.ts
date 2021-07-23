import { QueryResolvers } from '../__generated__/schema'
import { users } from '../db'

export const ViewerQuery: QueryResolvers['viewer'] = (_root, _args, ctx) => {
  return users().where({ id: ctx.userId }).first()
}
