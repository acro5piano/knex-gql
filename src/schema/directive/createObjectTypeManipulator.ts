import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import type { GraphQLObjectType } from 'graphql'

import type { IDirective } from '../../interfaces'
import type { KnexGql } from '../../knex-gql'

type SchemaMapper<DirectiveArgs> = (appValues: {
  knexGql: KnexGql
  type: GraphQLObjectType<any, any>
  directiveArgumentMap: DirectiveArgs
}) => GraphQLObjectType<any, any>

interface CreateObjectTypeManipulatorOption<DirectiveArgs> {
  name: string
  definition: string
  schemaMapper: SchemaMapper<DirectiveArgs>
}

export function createObjectTypeManipulator<DirectiveArgs>(
  option: CreateObjectTypeManipulatorOption<DirectiveArgs>,
): IDirective {
  return {
    name: option.name,
    definition: option.definition,
    getSchemaTransformer: (knexGql) => {
      return function (schema) {
        return mapSchema(schema, {
          [MapperKind.OBJECT_TYPE]: (type) => {
            const directives = getDirectives(schema, type)
            const directiveArgumentMap = directives[option.name]
            if (!directiveArgumentMap) {
              return type
            }
            return option.schemaMapper({
              knexGql,
              type,
              directiveArgumentMap,
            })
          },
        })
      }
    },
  }
}
