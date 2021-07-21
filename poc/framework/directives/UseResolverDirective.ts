import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { gql } from '../util'

export const UseResolverDirective: IDirective = {
  name: 'useResolver',
  definition: gql`
    directive @useResolver(resolver: String!) on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function useResolverDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['useResolver']
          if (directiveArgumentMap) {
            console.log(knexGql.resolverMap)
            console.log(
              knexGql.resolverMap.get(directiveArgumentMap['resolver']),
            )
            fieldConfig.resolve = knexGql.resolverMap.get(
              directiveArgumentMap['resolver'],
            )!
          }
          return fieldConfig
        },
      })
    }
  },
}
