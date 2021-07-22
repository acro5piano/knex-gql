import type { GraphQLFieldConfig } from 'graphql'
import { Knex } from 'knex'

import type { KnexGql } from '../knex-gql'
import { getArgumentValuesByDirectiveName } from '../util'
import { applyWhereToQuery } from './applyWhereToQuery'

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
  applyWhereToQuery(query, whereArgs, args)
  return query
}
