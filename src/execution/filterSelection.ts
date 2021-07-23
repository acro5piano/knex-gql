import type { GraphQLResolveInfo } from 'graphql'
import { fieldsList } from 'graphql-fields-list'

import type { KnexGql } from '../knex-gql'

interface FilterSelectionsProps {
  info: GraphQLResolveInfo
  table: string
  knexGql: KnexGql
  alwaysLoadColumns?: string[]
}

export function filterGraphQLSelections({
  info,
  table,
  knexGql,
  alwaysLoadColumns = [],
}: FilterSelectionsProps) {
  const existingColumns = knexGql.tableColumnsMap.get(table)
  if (!existingColumns) {
    // Empty array force Knex to select all columns (select `*`)
    return []
  }
  const selectionSets = fieldsList(info)
  if (!selectionSets.includes('id')) {
    selectionSets.push('id')
  }

  // Always load foreign key to prepare Dataloader
  knexGql.tableColumnsMap.forEach((info) => {
    selectionSets.push(...info.referenceColumns)
  })

  return [
    ...existingColumns.columns.filter((c) => selectionSets.includes(c)),
    ...alwaysLoadColumns,
  ]
}
