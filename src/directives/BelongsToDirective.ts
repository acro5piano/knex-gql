import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IContext, IDirective } from '../interfaces'
import { getRawType, gql } from '../util'

export const BelongsToDirective: IDirective = {
  name: 'belongsTo',
  definition: gql`
    directive @belongsTo(foreignKey: String!) on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function belongsToDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['belongsTo']
          if (directiveArgumentMap) {
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            fieldConfig.resolve = (root, _args, ctx: IContext) => {
              return ctx.batchLoader
                .getLoader('belongsTo', tableName!)
                .load(root[directiveArgumentMap['foreignKey']])
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
