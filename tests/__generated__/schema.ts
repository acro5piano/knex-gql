/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';

export interface IKnexGqlContext {}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
}
  

export interface User {
  id: string
  name: string
  hashedName: string
  createdAt: string
  createdOn: string
  createdOnDayOfWeek: string
  posts: Post[]
  pageinatedPosts: Post[]
}

export interface UserInput {
  name: string
}

export interface Post {
  id: string
  userId: string
  title: string
  user: User
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

export interface QueryUserArgs {
  id: string
  name: string
}

export interface QueryUsersArgs {
  name: string
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
  id: ResolverFn<string, User, IKnexGqlContext, {}>
  name: ResolverFn<string, User, IKnexGqlContext, {}>
  hashedName: ResolverFn<string, User, IKnexGqlContext, {}>
  createdAt: ResolverFn<string, User, IKnexGqlContext, {}>
  createdOn: ResolverFn<string, User, IKnexGqlContext, {}>
  createdOnDayOfWeek: ResolverFn<string, User, IKnexGqlContext, {}>
  posts: ResolverFn<Post[], User, IKnexGqlContext, UserPostsArgs>
  pageinatedPosts: ResolverFn<Post[], User, IKnexGqlContext, UserPageinatedPostsArgs>
}

export type UserInputResolvers = {
  name: ResolverFn<string, UserInput, IKnexGqlContext, {}>
}

export type PostResolvers = {
  id: ResolverFn<string, Post, IKnexGqlContext, {}>
  userId: ResolverFn<string, Post, IKnexGqlContext, {}>
  title: ResolverFn<string, Post, IKnexGqlContext, {}>
  user: ResolverFn<User, Post, IKnexGqlContext, {}>
}

export type PostInputResolvers = {
  user_id: ResolverFn<string, PostInput, IKnexGqlContext, {}>
  title: ResolverFn<string, PostInput, IKnexGqlContext, {}>
}

export type LoginPayloadResolvers = {
  token: ResolverFn<string, LoginPayload, IKnexGqlContext, {}>
  user: ResolverFn<User, LoginPayload, IKnexGqlContext, {}>
}

export type QueryResolvers = {
  user?: ResolverFn<User, Query, IKnexGqlContext, QueryUserArgs>
  firstUser?: ResolverFn<User, Query, IKnexGqlContext, {}>
  allUsers: ResolverFn<User[], Query, IKnexGqlContext, {}>
  users: ResolverFn<User[], Query, IKnexGqlContext, QueryUsersArgs>
  post?: ResolverFn<Post, Query, IKnexGqlContext, QueryPostArgs>
  viewer?: ResolverFn<User, Query, IKnexGqlContext, {}>
}

export type MutationResolvers = {
  createUser: ResolverFn<User, Mutation, IKnexGqlContext, MutationCreateUserArgs>
  createPost: ResolverFn<Post, Mutation, IKnexGqlContext, MutationCreatePostArgs>
  login: ResolverFn<LoginPayload, Mutation, IKnexGqlContext, MutationLoginArgs>
}