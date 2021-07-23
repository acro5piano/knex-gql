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
  const selectionSets = fieldsList(info)
  if (!selectionSets.includes('id')) {
    selectionSets.push('id')
  }
  const existingColumns = knexGql.tableColumnsMap.get(table)
  if (!existingColumns) {
    return selectionSets
  }

  return existingColumns.filter((c) => selectionSets.includes(c))
}
