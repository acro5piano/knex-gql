import { BelongsToDirectiveArgs } from '../__generated__/schema'
import { filterGraphQLSelections } from '../execution/filterSelection'
import { IContext } from '../interfaces'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

export const BelongsToDirective =
  createFieldManipulator<BelongsToDirectiveArgs>({
    name: 'belongsTo',
    definition: gql`
      directive @belongsTo(foreignKey: String!) on FIELD_DEFINITION
    `,
    schemaMapper: ({
      knexGql,
      fieldConfig,
      directiveArgumentMap,
      targetTableName,
    }) => {
      fieldConfig.resolve = (root, _args, ctx: IContext, info) => {
        const columns = filterGraphQLSelections({
          info,
          knexGql,
          table: targetTableName!,
          alwaysLoadColumns: [directiveArgumentMap.foreignKey],
        })
        return ctx.batchLoader
          .getLoader({
            type: 'belongsTo',
            targetTable: targetTableName!,
            queryModifier: (query) => {
              query.select(columns)
            },
          })
          .load(root[directiveArgumentMap.foreignKey])
      }
      return fieldConfig
    },
  })
