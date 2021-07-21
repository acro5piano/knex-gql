import { StringValueNode } from 'graphql'

import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { getArgumentValuesByDirectiveName, gql } from '../util'

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
    const whereArgs = getArgumentValuesByDirectiveName(
      'where',
      fieldConfig.astNode?.arguments,
    )
    fieldConfig.resolve = (root, args, ctx, info) => {
      // nextValue should be a knex instance
      const nextValue = originalResolve?.(root, args, ctx, info)
      if (nextValue) {
        return nextValue.first()
      }
      const query = knexGql.knex(targetTableName)
      // TODO: In the near future, we should combine data fetching logic
      // like @eq and @where, as we would like to add @whereIn and @whereNot and so on.
      whereArgs.forEach((where) => {
        const value = args[where.name.value]
        if (value) {
          const operator =
            (
              where.directives?.[0]?.arguments?.[0]?.value as
                | StringValueNode
                | undefined
            )?.value || '='
          query.where(where.name.value, operator, value)
        }
      })
      return query.first()
    }
    return fieldConfig
  },
})
