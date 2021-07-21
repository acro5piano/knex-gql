import {
  GraphQLObjectType,
  GraphQLType,
  InputValueDefinitionNode,
  isListType,
  isNonNullType,
} from 'graphql'
import type { Knex } from 'knex'

export const gql = String.raw

export function getRawType(type?: GraphQLType): GraphQLObjectType {
  if (!type) {
    throw new Error()
  }
  if (isNonNullType(type)) {
    return getRawType(type.ofType)
  }
  if (isListType(type)) {
    return getRawType(type.ofType)
  }
  return type as GraphQLObjectType
}

export async function resolveFirst(p: Knex.QueryBuilder) {
  return (await p)[0]
}

export function getArgumentValuesByDirectiveName(
  directiveName: string,
  args?: ReadonlyArray<InputValueDefinitionNode>,
) {
  if (!args) {
    return []
  }
  return args.filter(
    (arg) =>
      arg.directives?.map((d) => d.name.value === directiveName).length ||
      0 > 0,
  )
}
