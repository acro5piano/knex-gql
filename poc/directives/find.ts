import { DirectiveResolverFn } from '@graphql-tools/utils'
import { getRawType } from '../util'
import type { KnexGql } from '../knex-gql'
import { gql } from '../util'

export const definition = gql`
  directive @find on FIELD_DEFINITION
`

export const factory = (knexGql: KnexGql) => {
  const findDirective: DirectiveResolverFn = (
    _next,
    _root,
    _args,
    _ctx,
    info,
  ) => {
    const targetType = getRawType(info.returnType)
    const tableName = knexGql.tableNameMap.get(targetType.name)
    return knexGql.knex(tableName).first()
  }
  return findDirective
}
