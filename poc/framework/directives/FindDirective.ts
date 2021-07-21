import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { getArgumentValuesByDirectiveName, getRawType, gql } from '../util'

export const FindDirective: IDirective = {
  name: 'find',
  definition: gql`
    directive @find on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function findDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['find']
          if (directiveArgumentMap) {
            const eqFieldNames = getArgumentValuesByDirectiveName(
              'eq',
              fieldConfig.astNode?.arguments,
            ).map((d) => d.name.value)
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            fieldConfig.resolve = (_root, args) => {
              const query = knexGql.knex(tableName)
              eqFieldNames.forEach((fieldName) => {
                const value = args[fieldName]
                if (value) {
                  query.where(fieldName, value)
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
