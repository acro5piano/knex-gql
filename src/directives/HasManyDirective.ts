import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import { GraphQLInt } from 'graphql'

import { applyWhereToQuery } from '../execution/applyWhereToQuery'
import { IContext, IDirective } from '../interfaces'
import { getArgumentValuesByDirectiveName, getRawType, gql } from '../util'

type HasManyType = 'PAGINATOR' | 'SIMPLE'

const DEFAULT_LIMIT = 20

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
            const whereArgs = getArgumentValuesByDirectiveName(
              'where',
              fieldConfig.astNode?.arguments,
            )
            const type: HasManyType = directiveArgumentMap['type']
            const limit: number = directiveArgumentMap['limit'] || DEFAULT_LIMIT
            switch (type) {
              case 'SIMPLE':
                fieldConfig.resolve = (root, args, ctx: IContext) => {
                  return ctx.batchLoader
                    .getLoader({
                      type: 'hasMany',
                      targetTable: tableName!,
                      foreignKey: directiveArgumentMap['foreignKey'],
                      queryModifier: (query) => {
                        applyWhereToQuery(query, whereArgs, args)
                      },
                    })
                    .load(root.id)
                }
                break
              case 'PAGINATOR':
                if (!fieldConfig.args) {
                  fieldConfig.args = {}
                }
                fieldConfig.args['page'] = {
                  type: GraphQLInt,
                  defaultValue: 1,
                }
                fieldConfig.resolve = (root, args, ctx: IContext) => {
                  const offset = (args['page'] - 1) * limit
                  return ctx.batchLoader
                    .getLoader({
                      type: 'hasMany',
                      targetTable: tableName!,
                      foreignKey: directiveArgumentMap['foreignKey'],
                      page: {
                        limit,
                        offset,
                      },
                      queryModifier: (query) => {
                        applyWhereToQuery(query, whereArgs, args)
                      },
                    })
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
