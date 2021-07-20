import { IDirectiveResolvers } from '@graphql-tools/utils'
import createKnex from 'knex'
import { knexLittleLogger } from 'knex-little-logger'

import { KnexGql, gql } from '../framework'

const knex = createKnex({
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
})

knexLittleLogger(knex)

const typeDefs = gql`
  directive @stringReplace(str: String, with: String) on FIELD_DEFINITION

  type User @table(name: "users") {
    id: ID!
    name: String! @stringReplace(str: "ka", with: "KA")
  }

  input UserInput {
    id: ID!
    name: String!
  }

  type Query {
    user: User! @find
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
