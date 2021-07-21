import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { getRawType, gql, resolveFirst } from '../util'

export const InsertDirective: IDirective = {
  name: 'insert',
  definition: gql`
    directive @insert on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function insertDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.MUTATION_ROOT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['insert']
          if (directiveArgumentMap) {
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            fieldConfig.resolve = (_root, args) => {
              return resolveFirst(
                knexGql.knex(tableName).insert(args['input']).returning('*'),
              ) // TODO: filter keys based on node field set selection
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
