import { MapperKind, getDirectives, mapSchema } from '@graphql-tools/utils'
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLType,
} from 'graphql'

import type { IDirective } from '../../interfaces'
import type { KnexGql } from '../../knex-gql'
import { getRawType } from '../../util'

type SchemaMapper<DirectiveArgs> = (appValues: {
  knexGql: KnexGql
  fieldConfig: GraphQLFieldConfig<any, any>
  targetType: GraphQLType
  targetTableName?: string
  originalResolve?: GraphQLFieldResolver<any, any>
  directiveArgumentMap: DirectiveArgs
}) => GraphQLFieldConfig<any, any>

interface CreateFieldManipulatorOption<DirectiveArgs> {
  name: string
  definition: string
  schemaMapper: SchemaMapper<DirectiveArgs>
}

export function createFieldManipulator<DirectiveArgs>(
  option: CreateFieldManipulatorOption<DirectiveArgs>,
): IDirective {
  return {
    name: option.name,
    definition: option.definition,
    getSchemaTransformer: (knexGql) => {
      return function (schema) {
        return mapSchema(schema, {
          [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directives = getDirectives(schema, fieldConfig)
            const directiveArgumentMap = directives[option.name]
            if (!directiveArgumentMap) {
              return fieldConfig
            }
            const originalResolve = fieldConfig.resolve
            const targetType = getRawType(fieldConfig.type)
            const targetTableName = knexGql.tableNameMap.get(targetType.name)
            return option.schemaMapper({
              fieldConfig,
              knexGql,
              originalResolve,
              targetType,
              targetTableName,
              directiveArgumentMap,
            })
          },
        })
      }
    },
  }
}
