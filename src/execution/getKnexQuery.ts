import type { GraphQLFieldConfig, StringValueNode } from 'graphql'
import { Knex } from 'knex'

import type { KnexGql } from '../knex-gql'
import { getArgumentValuesByDirectiveName } from '../util'

function isKnexQuery(val: any): val is Knex.QueryBuilder {
  return val && 'then' in val && 'from' in val && 'select' in val
}

export function getKnexQuery(
  fieldConfig: GraphQLFieldConfig<any, any>,
  knexGql: KnexGql,
  tableName: string,
  nextValue: any,
  args: any,
): Knex.QueryBuilder {
  if (isKnexQuery(nextValue)) {
    return nextValue
  }

  // Handle @where arguments.
  const whereArgs = getArgumentValuesByDirectiveName(
    'where',
    fieldConfig.astNode?.arguments,
  )
  const query = knexGql.knex(tableName)
  whereArgs.forEach((where) => {
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
