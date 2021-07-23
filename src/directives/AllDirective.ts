import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

export const AllDirective = createFieldManipulator({
  name: 'all',
  definition: gql`
    directive @all on FIELD_DEFINITION
  `,
  schemaMapper: ({ fieldConfig, targetTableName, knexGql }) => {
    fieldConfig.resolve = (_root, _args) => {
      const query = knexGql.knex(targetTableName)
      return query
    }
    return fieldConfig
  },
})
