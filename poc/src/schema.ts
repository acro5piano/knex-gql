import { IDirectiveResolvers } from '@graphql-tools/utils'

import { KnexGql, gql } from '../framework'
import { knex } from './knex'

const typeDefs = gql`
  directive @stringReplace(str: String, with: String) on FIELD_DEFINITION

  type User @table(name: "users") {
    id: ID!
    name: String! @stringReplace(str: "ka", with: "KA")
  }

  input UserInput {
    name: String!
  }

  type Query {
    user(id: ID @eq): User @find
  }

  type Mutation {
    createUser(input: UserInput!): User! @create
  }
`

const directiveResolvers: IDirectiveResolvers = {
  stringReplace(next, _root, args) {
    return next().then((name: string) => {
      return name.replace(args['str'], args['with'])
    })
  },
}

export const knexGql = new KnexGql({ knex, typeDefs, directiveResolvers })
