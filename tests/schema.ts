import { KnexGql, gql } from '../src'
import { DateFormatDirective } from './directives/DateFormatDirective'
import { knexWithLog } from './knex'
import { LoginMutation } from './resolvers/LoginMutation'
import { ViewerQuery } from './resolvers/ViewerQuery'

const typeDefs = gql`
  type User @table(name: "users") {
    id: ID!
    name: String!
    createdAt: DateTime!
    createdOn: String! @dateFormat(format: "YYYY-MM-DD")
    createdOnDayOfWeek: String! @dateFormat(format: "ddd")
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

export const knexGql = new KnexGql({
  knex: knexWithLog,
  typeDefs,
  directiveResolvers: [DateFormatDirective],
  fieldResolvers: [
    LoginMutation,
    ViewerQuery as any, // TODO
  ],
})
