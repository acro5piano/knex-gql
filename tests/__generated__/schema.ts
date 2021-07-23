/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
}
  

export interface TableDirectiveArgs {
  name: string
}

export interface BelongsToDirectiveArgs {
  foreignKey: string
}

export interface HasManyDirectiveArgs {
  foreignKey: string
  type: HasManyType
  limit: number
}

export interface WhereDirectiveArgs {
  operator: string
}

export interface PaginateDirectiveArgs {
  queryBuilder?: string
  limit: number
}

export interface UseResolverDirectiveArgs {
  resolver: string
}

export interface HasManyThroughDirectiveArgs {
  through: string
  from: string
  to: string
  type: HasManyType
  limit: number
}

export interface DateFormatDirectiveArgs {
  key: string
  format: string
}

export type HasManyType = 
  | 'PAGINATOR'
  | 'SIMPLE'

export interface User {
  id: string
  name: string
  hashedName: string
  createdAt: string
  createdOn: string
  createdOnDayOfWeek: string
  posts: Post[]
  pageinatedPosts: Post[]
  comments: Comment[]
  commentsSimple: Comment[]
}

export interface UserInput {
  name: string
}

export interface Post {
  id: string
  userId: string
  title: string
  user: User
  comments: Comment[]
}

export interface Comment {
  id: string
  postId: string
  content: string
}

export interface PostInput {
  user_id: string
  title: string
}

export interface LoginPayload {
  token: string
  user: User
}

export interface Query {
  user?: User
  firstUser?: User
  allUsers: User[]
  users: User[]
  userSearch: User[]
  post?: Post
  viewer?: User
}

export interface Mutation {
  createUser: User
  createPost: Post
  login: LoginPayload
}



export interface UserPostsArgs {
  title: string
}

export interface UserPageinatedPostsArgs {
  title: string
  page: number
}

export interface UserCommentsArgs {
  content: string
  page: number
}

export interface UserCommentsSimpleArgs {
  content: string
}

export interface PostCommentsArgs {
  page: number
}

export interface QueryUserArgs {
  id: string
  name: string
}

export interface QueryUsersArgs {
  name: string
  page: number
}

export interface QueryUserSearchArgs {
  term: string
  page: number
}

export interface QueryPostArgs {
  id: string
}

export interface MutationCreateUserArgs {
  input: UserInput
}

export interface MutationCreatePostArgs {
  input: PostInput
}

export interface MutationLoginArgs {
  userId: string
  password: string
}



export type UserResolvers = {
  id: ResolverFn<string, User, KnexGqlContext, {}>
  name: ResolverFn<string, User, KnexGqlContext, {}>
  hashedName: ResolverFn<string, User, KnexGqlContext, {}>
  createdAt: ResolverFn<string, User, KnexGqlContext, {}>
  createdOn: ResolverFn<string, User, KnexGqlContext, {}>
  createdOnDayOfWeek: ResolverFn<string, User, KnexGqlContext, {}>
  posts: ResolverFn<Post[], User, KnexGqlContext, UserPostsArgs>
  pageinatedPosts: ResolverFn<Post[], User, KnexGqlContext, UserPageinatedPostsArgs>
  comments: ResolverFn<Comment[], User, KnexGqlContext, UserCommentsArgs>
  commentsSimple: ResolverFn<Comment[], User, KnexGqlContext, UserCommentsSimpleArgs>
}

export type UserInputResolvers = {
  name: ResolverFn<string, UserInput, KnexGqlContext, {}>
}

export type PostResolvers = {
  id: ResolverFn<string, Post, KnexGqlContext, {}>
  userId: ResolverFn<string, Post, KnexGqlContext, {}>
  title: ResolverFn<string, Post, KnexGqlContext, {}>
  user: ResolverFn<User, Post, KnexGqlContext, {}>
  comments: ResolverFn<Comment[], Post, KnexGqlContext, PostCommentsArgs>
}

export type CommentResolvers = {
  id: ResolverFn<string, Comment, KnexGqlContext, {}>
  postId: ResolverFn<string, Comment, KnexGqlContext, {}>
  content: ResolverFn<string, Comment, KnexGqlContext, {}>
}

export type PostInputResolvers = {
  user_id: ResolverFn<string, PostInput, KnexGqlContext, {}>
  title: ResolverFn<string, PostInput, KnexGqlContext, {}>
}

export type LoginPayloadResolvers = {
  token: ResolverFn<string, LoginPayload, KnexGqlContext, {}>
  user: ResolverFn<User, LoginPayload, KnexGqlContext, {}>
}

export type QueryResolvers = {
  user?: ResolverFn<User| undefined | null, Query, KnexGqlContext, QueryUserArgs>
  firstUser?: ResolverFn<User| undefined | null, Query, KnexGqlContext, {}>
  allUsers: ResolverFn<User[], Query, KnexGqlContext, {}>
  users: ResolverFn<User[], Query, KnexGqlContext, QueryUsersArgs>
  userSearch: ResolverFn<User[], Query, KnexGqlContext, QueryUserSearchArgs>
  post?: ResolverFn<Post| undefined | null, Query, KnexGqlContext, QueryPostArgs>
  viewer?: ResolverFn<User| undefined | null, Query, KnexGqlContext, {}>
}

export type MutationResolvers = {
  createUser: ResolverFn<User, Mutation, KnexGqlContext, MutationCreateUserArgs>
  createPost: ResolverFn<Post, Mutation, KnexGqlContext, MutationCreatePostArgs>
  login: ResolverFn<LoginPayload, Mutation, KnexGqlContext, MutationLoginArgs>
}

export interface Resolvers {
  User: UserResolvers
  UserInput: UserInputResolvers
  Post: PostResolvers
  Comment: CommentResolvers
  PostInput: PostInputResolvers
  LoginPayload: LoginPayloadResolvers
  Query: QueryResolvers
  Mutation: MutationResolvers
}