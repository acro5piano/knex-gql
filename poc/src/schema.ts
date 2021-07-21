import { IDirectiveResolvers } from '@graphql-tools/utils'

import { KnexGql, gql } from '../framework'
import { knex } from './knex'
import { LoginMutation } from './resolvers/LoginMutation'
import { ViewerQuery } from './resolvers/ViewerQuery'

const typeDefs = gql`
  directive @stringReplace(str: String, with: String) on FIELD_DEFINITION

  type User @table(name: "users") {
    id: ID!
    name: String! @stringReplace(str: "ka", with: "KA")
    posts: [Post!]! @hasMany(foreignKey: "user_id")
    pageinatedPosts: [Post!]!
      @hasMany(foreignKey: "user_id", type: PAGINATOR, limit: 7)
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

  type LoginPayload {
    token: String!
    user: User!
  }

  type Query {
    user(
      id: ID @where(operator: "=")
      name: String @where(operator: "LIKE")
    ): User @first
    firstUser: User @first
    allUsers: [User!]! @all
    users(name: String @where(operator: "ILIKE")): [User!]! @paginate(limit: 5)
    post(id: ID! @where): Post @first
    viewer: User @useResolver(resolver: "ViewerQuery")
  }

  type Mutation {
    createUser(input: UserInput!): User! @insert
    createPost(input: PostInput!): Post! @insert
    login(userId: ID!, password: String!): LoginPayload!
      @useResolver(resolver: "LoginMutation")
  }
`

const directiveResolvers: IDirectiveResolvers = {
  stringReplace(next, _root, args) {
    return next().then((name: string) => {
      return name.replace(args['str'], args['with'])
    })
  },
}

export const knexGql = new KnexGql({
  knex,
  typeDefs,
  directiveResolvers,
  errorHandler: console.error,
  fieldResolvers: [
    LoginMutation,
    ViewerQuery as any, // TODO
  ],
})
