import { GraphQLInt } from 'graphql'

import { HasManyThroughDirectiveArgs } from '../__generated__/schema'
import { applyWhereToQuery } from '../execution/applyWhereToQuery'
import { filterGraphQLSelections } from '../execution/filterSelection'
import { KnexGqlContext } from '../interfaces'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { getArgumentValuesByDirectiveName, gql } from '../util'

const DEFAULT_LIMIT = 20

export const HasManyThroughDirective =
  createFieldManipulator<HasManyThroughDirectiveArgs>({
    name: 'hasManyThrough',
    definition: gql`
      directive @hasManyThrough(
        through: String!
        from: String!
        to: String!
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
                type: 'hasManyThrough',
                targetTable: targetTableName!,
                through: {
                  table: directiveArgumentMap.through,
                  from: directiveArgumentMap.from,
                  to: directiveArgumentMap.to,
                },
                queryModifier: (query) => {
                  applyWhereToQuery(query, whereArgs, args)
                  const columns = filterGraphQLSelections({
                    info,
                    knexGql,
                    table: targetTableName!,
                    alwaysLoadColumns: [
                      directiveArgumentMap.to,
                      directiveArgumentMap.from,
                    ],
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
                type: 'hasManyThrough',
                targetTable: targetTableName!,
                through: {
                  table: directiveArgumentMap.through,
                  from: directiveArgumentMap.from,
                  to: directiveArgumentMap.to,
                },
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
                    alwaysLoadColumns: [
                      directiveArgumentMap.to,
                      directiveArgumentMap.from,
                    ],
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
