import { UseResolverDirectiveArgs } from '../__generated__/schema'
import { createFieldManipulator } from '../schema/directive/createFieldManipulator'
import { gql } from '../util'

// TODO: No more need this??
export const UseResolverDirective =
  createFieldManipulator<UseResolverDirectiveArgs>({
    name: 'useResolver',
    definition: gql`
      directive @useResolver(resolver: String!) on FIELD_DEFINITION
    `,
    schemaMapper: ({ knexGql, fieldConfig, directiveArgumentMap }) => {
      fieldConfig.resolve = knexGql.resolverMap.get(
        directiveArgumentMap['resolver'],
      )!
      return fieldConfig
    },
  })
