import {
  GraphQLObjectType,
  GraphQLType,
  isListType,
  isNonNullType,
} from 'graphql'

export const gql = ([a]: TemplateStringsArray) => a!

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
