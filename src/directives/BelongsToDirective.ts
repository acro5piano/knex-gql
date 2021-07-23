import { IContext } from '../interfaces'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

export const BelongsToDirective = createFieldManipulator({
  name: 'belongsTo',
  definition: gql`
    directive @belongsTo(foreignKey: String!) on FIELD_DEFINITION
  `,
  schemaMapper: ({ fieldConfig, directiveArgumentMap, targetTableName }) => {
    fieldConfig.resolve = (root, _args, ctx: IContext) => {
      return ctx.batchLoader
        .getLoader({ type: 'belongsTo', targetTable: targetTableName! })
        .load(root[directiveArgumentMap['foreignKey']])
    }
    return fieldConfig
  },
})
