import { GraphQLInt } from 'graphql'

import { HasManyDirectiveArgs } from '../__generated__/schema'
import { applyWhereToQuery } from '../execution/applyWhereToQuery'
import { filterGraphQLSelections } from '../execution/filterSelection'
import { KnexGqlContext } from '../interfaces'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { getArgumentValuesByDirectiveName, gql } from '../util'

const DEFAULT_LIMIT = 20

export const HasManyDirective = createFieldManipulator<HasManyDirectiveArgs>({
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
  schemaMapper: ({
    knexGql,
    directiveArgumentMap,
    fieldConfig,
    targetTableName,
  }) => {
    const whereArgs = getArgumentValuesByDirectiveName(
      'where',
      fieldConfig.astNode?.arguments,
    )
    const limit = directiveArgumentMap.limit || DEFAULT_LIMIT
    switch (directiveArgumentMap.type) {
      case 'SIMPLE':
        fieldConfig.resolve = (root, args, ctx: KnexGqlContext, info) => {
          return ctx.batchLoader
            .getLoader({
              type: 'hasMany',
              targetTable: targetTableName!,
              foreignKey: directiveArgumentMap.foreignKey,
              queryModifier: (query) => {
                applyWhereToQuery(query, whereArgs, args)
                const columns = filterGraphQLSelections({
                  info,
                  knexGql,
                  table: targetTableName!,
                  alwaysLoadColumns: [directiveArgumentMap.foreignKey],
                })
                query.select(columns)
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
        fieldConfig.resolve = (root, args, ctx: KnexGqlContext, info) => {
          const offset = (args['page'] - 1) * limit
          return ctx.batchLoader
            .getLoader({
              type: 'hasMany',
              targetTable: targetTableName!,
              foreignKey: directiveArgumentMap.foreignKey,
              page: {
                limit,
                offset,
              },
              queryModifier: (query) => {
                applyWhereToQuery(query, whereArgs, args)
                const columns = filterGraphQLSelections({
                  info,
                  knexGql,
                  table: targetTableName!,
                  alwaysLoadColumns: [directiveArgumentMap.foreignKey],
                })
                query.select(columns)
              },
            })
            .load(root.id)
        }
        break
    }
    return fieldConfig
  },
})
