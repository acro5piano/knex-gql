import { IDirectiveResolvers } from '@graphql-tools/utils'

import { KnexGql, gql } from '../framework'
import { knex } from './knex'

const typeDefs = gql`
  directive @stringReplace(str: String, with: String) on FIELD_DEFINITION

  type User @table(name: "users") {
    id: ID!
    name: String! @stringReplace(str: "ka", with: "KA")
    posts: [Post!]! @hasMany(foreignKey: "user_id")
  }

  input UserInput {
    name: String!
  }

  type Post @table(name: "posts") {
    id: ID!
    user_id: ID!
    title: String!
    user: User! @belongsTo(foreignKey: "user_id")
  }

  input PostInput {
    user_id: ID!
    title: String!
  }

  type Query {
    user(id: ID @eq, name: String @eq): User @find
    allUsers: [User!]! @all
    post(id: ID! @eq): Post @find
  }

  type Mutation {
    createUser(input: UserInput!): User! @create
    createPost(input: PostInput!): Post! @create
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
