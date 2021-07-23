import path from 'path'

import { KnexGql, gql } from '../src'
import { Resolvers } from './__generated__/schema'
import { DateFormatDirective } from './directives/DateFormatDirective'
import { knexWithLog } from './knex'
import { LoginMutation } from './resolvers/LoginMutation'
import { UserField } from './resolvers/UserField'
import { ViewerQuery } from './resolvers/ViewerQuery'

interface AppContext {
  userId?: string
}

declare module './__generated__/schema' {
  interface IKnexGqlContext extends AppContext {}
}

const typeDefs = gql`
  type User @table(name: "users") {
    id: ID!
    name: String!
    hashedName: String!
    createdAt: DateTime!
    createdOn: String! @dateFormat(key: "createdAt", format: "YYYY-MM-DD")
    createdOnDayOfWeek: String! @dateFormat(key: "createdAt", format: "ddd")
    posts(title: String @where(operator: "LIKE")): [Post!]!
      @hasMany(foreignKey: "userId")
    pageinatedPosts(title: String @where(operator: "LIKE")): [Post!]!
      @hasMany(foreignKey: "userId", type: PAGINATOR, limit: 7)
  }

  input UserInput {
    name: String!
  }

  type Post @table(name: "posts") {
    id: ID!
    userId: ID!
    title: String!
    user: User! @belongsTo(foreignKey: "userId")
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
    userSearch(term: String!): [User!]!
      @paginate(queryBuilder: "SearchUserQuery", limit: 5)
    post(id: ID! @where): Post @first
    viewer: User
  }

  type Mutation {
    createUser(input: UserInput!): User! @insert
    createPost(input: PostInput!): Post! @insert
    login(userId: ID!, password: String!): LoginPayload!
  }
`

export const knexGql = new KnexGql({
  knex: knexWithLog,
  typeDefs,
  directiveResolvers: [DateFormatDirective],
  fieldResolvers: [],
  resolvers: {
    Mutation: {
      login: LoginMutation,
    },
    Query: {
      viewer: ViewerQuery,
    },
    User: UserField,
  } as Partial<Resolvers>,
  emitSchema: path.resolve(__dirname, '__generated__/schema.gql'),
  emitTypeScriptDefs: path.resolve(__dirname, '__generated__/schema.ts'),
})
