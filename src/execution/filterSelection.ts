import type { GraphQLResolveInfo } from 'graphql'
import { fieldsList } from 'graphql-fields-list'

import type { KnexGql } from '../knex-gql'

interface FilterSelectionsProps {
  info: GraphQLResolveInfo
  table: string
  knexGql: KnexGql
}

export function filterGraphQLSelections({
  info,
  table,
  knexGql,
}: FilterSelectionsProps) {
  const existingColumns = knexGql.tableColumnsMap.get(table)
  if (!existingColumns) {
    return [] // This selects all columns (select `*`)
  }
  const selectionSets = fieldsList(info)
  if (!selectionSets.includes('id')) {
    selectionSets.push('id')
  }

  return existingColumns.filter((c) => selectionSets.includes(c))
}
