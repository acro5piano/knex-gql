import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import { StringValueNode } from 'graphql'

import { IDirective } from '../interfaces'
import { getArgumentValuesByDirectiveName, getRawType, gql } from '../util'

export const FirstDirective: IDirective = {
  name: 'first',
  definition: gql`
    directive @first on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function findDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['first']
          if (directiveArgumentMap) {
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            const originalResolve = fieldConfig.resolve
            const whereArgs = getArgumentValuesByDirectiveName(
              'where',
              fieldConfig.astNode?.arguments,
            )
            fieldConfig.resolve = (root, args, ctx, info) => {
              // nextValue should be a knex instance
              const nextValue = originalResolve?.(root, args, ctx, info)
              if (nextValue) {
                return nextValue.first()
              }
              const query = knexGql.knex(tableName)
              // TODO: In the near future, we should combine data fetching logic
              // like @eq and @where, as we would like to add @whereIn and @whereNot and so on.
              whereArgs.forEach((where) => {
                const value = args[where.name.value]
                if (value) {
                  const operator = (
                    where.directives?.[0]?.arguments?.[0]?.value as
                      | StringValueNode
                      | undefined
                  )?.value
                  if (!operator) {
                    throw new Error('operator is not defined')
                  }
                  query.where(where.name.value, operator, value)
                }
              })
              return query.first()
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
