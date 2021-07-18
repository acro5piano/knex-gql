import { gql } from './util'
import { KnexGql } from './knex-gql'
import createKnex from 'knex'
import { knexLittleLogger } from 'knex-little-logger'

const knex = createKnex({
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
})

knexLittleLogger(knex)

const typeDefs = gql`
  directive @stringReplace(str: String, with: String) on FIELD_DEFINITION
  directive @find on FIELD_DEFINITION
  directive @create on FIELD_DEFINITION
  directive @table(name: String!) on OBJECT

  type User @table(name: "users") {
    id: ID!
    name: String! @stringReplace(str: "ka", with: "KA")
  }

  input UserInput {
    name: String!
  }

  type Query {
    user: User! @find
  }

  type Mutation {
    createUser(input: UserInput!): User! @create
  }
`

export const knexGql = new KnexGql({ knex, typeDefs })
