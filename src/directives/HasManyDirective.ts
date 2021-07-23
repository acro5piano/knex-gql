import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import { GraphQLInt } from 'graphql'

import { applyWhereToQuery } from '../execution/applyWhereToQuery'
import { IContext, IDirective } from '../interfaces'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { getArgumentValuesByDirectiveName, getRawType, gql } from '../util'

type HasManyType = 'PAGINATOR' | 'SIMPLE'

const DEFAULT_LIMIT = 20

export const HasManyDirective: IDirective = createFieldManipulator({
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
  schemaMapper: ({ directiveArgumentMap, fieldConfig, targetTableName }) => {
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
              targetTable: targetTableName!,
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
              targetTable: targetTableName!,
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
    return fieldConfig
  },
})
