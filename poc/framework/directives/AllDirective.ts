import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { getRawType, gql } from '../util'

export const AllDirective: IDirective = {
  name: 'all',
  definition: gql`
    directive @all on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function hasManyDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['all']
          if (directiveArgumentMap) {
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            fieldConfig.resolve = (_root, _args) => {
              const query = knexGql.knex(tableName)
              return query
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
