import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { gql } from '../util'

export const TableDirective: IDirective = {
  name: 'table',
  definition: gql`
    directive @table(name: String!) on OBJECT
  `,
  getSchemaTransformer: (knexGql) => {
    return function createDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_TYPE]: (type) => {
          const directives = getDirectives(schema, type)
          const directiveArgumentMap = directives['table']
          if (directiveArgumentMap) {
            const { name } = directiveArgumentMap
            knexGql.tableNameMap.set(type.name, name)
          }
          return type
        },
      })
    }
  },
}
