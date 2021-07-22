import type { InputValueDefinitionNode, StringValueNode } from 'graphql'
import { Knex } from 'knex'

export function applyWhereToQuery(
  query: Knex.QueryBuilder,
  wheres: InputValueDefinitionNode[],
  args: any,
) {
  wheres.forEach((where) => {
    const value = args[where.name.value]
    if (value) {
      const operator =
        (
          where.directives?.[0]?.arguments?.[0]?.value as
            | StringValueNode
            | undefined
        )?.value || '='
      query.where(where.name.value, operator, value)
    }
  })
  return query
}
