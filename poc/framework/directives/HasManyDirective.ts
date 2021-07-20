import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { getRawType, gql } from '../util'

export const HasManyDirective: IDirective = {
  name: 'hasMany',
  definition: gql`
    directive @hasMany(foreignKey: String!) on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function hasManyDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['hasMany']
          if (directiveArgumentMap) {
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            fieldConfig.resolve = (root, _args) => {
              const query = knexGql
                .knex(tableName)
                .where(directiveArgumentMap['foreignKey'], root.id) // TODO: use dataloader to avoid N+1
              return query
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
