import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import { GraphQLInt } from 'graphql'

import { IContext, IDirective } from '../interfaces'
import { getRawType, gql } from '../util'

type HasManyType = 'PAGINATOR' | 'SIMPLE'

export const HasManyDirective: IDirective = {
  name: 'hasMany',
  definition: gql`
    enum HasManyType {
      PAGINATOR
      SIMPLE
    }
    directive @hasMany(
      foreignKey: String!
      type: HasManyType = SIMPLE
      limit: Int = 20
    ) on FIELD_DEFINITION
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
            const type: HasManyType = directiveArgumentMap['type']
            const limit: number = directiveArgumentMap['limit']
            switch (type) {
              case 'SIMPLE':
                fieldConfig.resolve = (root, _args, ctx: IContext) => {
                  return ctx.batchLoader
                    .getLoader(
                      'hasMany',
                      tableName!,
                      directiveArgumentMap['foreignKey'],
                    )
                    .load(root.id)
                }
                break
              case 'PAGINATOR':
                if (!fieldConfig.args) {
                  fieldConfig.args = {}
                }
                fieldConfig.args['page'] = {
                  type: GraphQLInt,
                }
                fieldConfig.resolve = (root, args, ctx: IContext) => {
                  const offset = (args['page'] - 1) * limit
                  return ctx.batchLoader
                    .getLoader(
                      'hasMany',
                      tableName!,
                      directiveArgumentMap['foreignKey'],
                      {
                        limit,
                        offset,
                      },
                    )
                    .load(root.id)
                }
                break
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
