import { GraphQLInt } from 'graphql'

import { PaginateDirectiveArgs } from '../__generated__/schema'
import { getKnexQuery } from '../execution/getKnexQuery'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

export const PaginateDirective = createFieldManipulator<PaginateDirectiveArgs>({
  name: 'paginate',
  definition: gql`
    directive @paginate(
      queryBuilder: String
      limit: Int = 20
    ) on FIELD_DEFINITION
  `,
  schemaMapper: ({
    targetTableName,
    originalResolve,
    fieldConfig,
    knexGql,
    directiveArgumentMap,
  }) => {
    const limit = directiveArgumentMap.limit
    if (!fieldConfig.args) {
      fieldConfig.args = {}
    }
    fieldConfig.args['page'] = {
      type: GraphQLInt,
      defaultValue: 1,
    }
    fieldConfig.resolve = (root, args, ctx, info) => {
      const offset = (args['page'] - 1) * limit
      const nextValue = originalResolve?.(root, args, ctx, info)
      const query = getKnexQuery(
        fieldConfig,
        knexGql,
        targetTableName!,
        nextValue,
        args,
      )
      return query.limit(limit).offset(offset)
    }
    return fieldConfig
  },
})
