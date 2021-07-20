import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { getRawType, gql, resolveFirst } from '../util'

export const CreateDirective: IDirective = {
  name: 'create',
  definition: gql`
    directive @create on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function createDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['create']
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
