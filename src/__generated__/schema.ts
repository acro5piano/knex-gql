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

export type HasManyType = 
  | 'PAGINATOR'
  | 'SIMPLE'





export interface Resolvers {
}