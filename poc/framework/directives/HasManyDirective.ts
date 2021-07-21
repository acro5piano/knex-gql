import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IContext, IDirective } from '../interfaces'
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
            fieldConfig.resolve = (root, _args, ctx: IContext) => {
              return ctx.batchLoader
                .getLoader(
                  'hasMany',
                  tableName!,
                  directiveArgumentMap['foreignKey'],
                )
                .load(root.id)
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
