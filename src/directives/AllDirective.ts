import { filterGraphQLSelections } from '../execution/filterSelection'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

export const AllDirective = createFieldManipulator({
  name: 'all',
  definition: gql`
    directive @all on FIELD_DEFINITION
  `,
  schemaMapper: ({ fieldConfig, targetTableName, knexGql }) => {
    fieldConfig.resolve = (_root, _args, _ctx, info) => {
      const columns = filterGraphQLSelections({
        info,
        knexGql,
        table: targetTableName!,
      })
      return knexGql.knex(targetTableName).select(columns)
    }
    return fieldConfig
  },
})
