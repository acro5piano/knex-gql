import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import { GraphQLInt } from 'graphql'

import { getKnexQuery } from '../execution/getKnexQuery'
import { IDirective } from '../interfaces'
import { getRawType, gql } from '../util'

export const PaginateDirective: IDirective = {
  name: 'paginate',
  definition: gql`
    directive @paginate(
      queryBuilder: String
      limit: Int = 20
    ) on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function paginateDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.QUERY_ROOT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['paginate']
          if (directiveArgumentMap) {
            const limit = directiveArgumentMap['limit']
            const typeName = getRawType(fieldConfig.type)
            const tableName = knexGql.tableNameMap.get(typeName.name)
            const originalResolve = fieldConfig.resolve
            if (!fieldConfig.args) {
              fieldConfig.args = {}
            }
            fieldConfig.args['page'] = {
              type: GraphQLInt,
              defaultValue: 1,
            }
            fieldConfig.resolve = (root, args, ctx, info) => {
              const offset = (args['page'] - 1) * limit
              const nextValue = originalResolve?.(root, args, ctx, info)
              const query = getKnexQuery(
                fieldConfig,
                knexGql,
                tableName!,
                nextValue,
                args,
              )
              return query.limit(limit).offset(offset)
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
