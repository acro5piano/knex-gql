import { getKnexQuery } from '../execution/getKnexQuery'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

export const FirstDirective = createFieldManipulator({
  name: 'first',
  definition: gql`
    directive @first on FIELD_DEFINITION
  `,
  schemaMapper: ({
    targetTableName,
    originalResolve,
    fieldConfig,
    knexGql,
  }) => {
    fieldConfig.resolve = (root, args, ctx, info) => {
      // nextValue should be a knex instance
      const nextValue = originalResolve?.(root, args, ctx, info)
      const query = getKnexQuery(
        fieldConfig,
        knexGql,
        targetTableName!,
        nextValue,
        args,
      )
      return query.first()
    }
    return fieldConfig
  },
})
