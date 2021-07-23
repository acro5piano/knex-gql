import type { ExecutableSchemaTransformation } from '@graphql-tools/schema'
import type { IFieldResolver } from '@graphql-tools/utils'
import type { GraphQLResolveInfo } from 'graphql'

import type { BatchLoader } from './execution/BatchLoader'
import type { KnexGql } from './knex-gql'

export interface KnexGqlContext {
  batchLoader: BatchLoader
}

export interface IDirective {
  name: string
  definition: string
  getSchemaTransformer?: (knexGql: KnexGql) => ExecutableSchemaTransformation
}

export interface IExecutionOption<V extends object = any> {
  variables?: V
  context?: any
}

export type ICustomResoverFn<
  T extends object,
  Ctx extends KnexGqlContext,
  Args extends object,
> = IFieldResolver<T, Ctx, Args>

export interface ICustomFieldResolver<
  T extends object = any,
  Ctx extends KnexGqlContext = KnexGqlContext,
  Args extends object = any,
> {
  name: string
  resolve: ICustomResoverFn<T, Ctx, Args>
}

export type IDirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: () => Promise<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>

export interface ICustomFieldDirective<T> {
  name: string
  definition: string
  resolve: IDirectiveResolverFn<any, any, KnexGqlContext, T>
}

export type ISimplePagenatorArgs = {
  limit: number
  offset: number
}
