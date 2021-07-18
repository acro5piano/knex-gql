import type { KnexGql } from '../knex-gql'
import { gql } from '../util'
import { GraphQLSchema } from 'graphql'
import { getDirectives, mapSchema, MapperKind } from '@graphql-tools/utils'

export const definition = gql`
  directive @create on FIELD_DEFINITION
`

export const factorySchemaTransformer = (knexGql: KnexGql) => {
  const createDirective = (schema: GraphQLSchema) =>
    mapSchema(schema, {
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
  return createDirective
}
