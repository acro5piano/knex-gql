import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'

import { IDirective } from '../interfaces'
import { gql } from '../util'

export const CreateDirective: IDirective = {
  name: 'create',
  definition: gql`
    directive @create on FIELD_DEFINITION
  `,
  getSchemaTransformer: (knexGql) => {
    return function createDirective(schema) {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directives = getDirectives(schema, fieldConfig)
          const directiveArgumentMap = directives['create']
          if (directiveArgumentMap) {
            fieldConfig.resolve = async (_root, args) => {
              await knexGql.knex('users').insert(args['input'])
              return knexGql
                .knex('users')
                .where({ id: args['input']['id'] })
                .first()
            }
          }
          return fieldConfig
        },
      })
    }
  },
}
