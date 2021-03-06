import { filterGraphQLSelections } from '../execution/filterSelection'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql, resolveFirst } from '../util'

export const InsertDirective = createFieldManipulator({
  name: 'insert',
  definition: gql`
    directive @insert on FIELD_DEFINITION
  `,
  schemaMapper: ({ fieldConfig, targetTableName, knexGql }) => {
    fieldConfig.resolve = (_root, args, _ctx, info) => {
      return resolveFirst(
        knexGql
          .knex(targetTableName)
          .insert(args['input'])
          .returning(
            filterGraphQLSelections({
              info,
              knexGql,
              table: targetTableName!,
            }),
          ),
      ) // TODO: filter keys based on node field set selection
    }
    return fieldConfig
  },
})
