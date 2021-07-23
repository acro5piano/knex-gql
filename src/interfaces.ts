import type { ExecutableSchemaTransformation } from '@graphql-tools/schema'
import type { IFieldResolver } from '@graphql-tools/utils'
import type { GraphQLResolveInfo } from 'graphql'

import type { BatchLoader } from './execution/BatchLoader'
import type { KnexGql } from './knex-gql'

export interface IContext {
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
  Ctx extends IContext,
  Args extends object,
> = IFieldResolver<T, Ctx, Args>

export interface ICustomFieldResolver<
  T extends object = any,
  Ctx extends IContext = IContext,
  Args extends object = any,
> {
  name: string
  resolve: ICustomResoverFn<T, Ctx, Args>
}

export type DirectiveResolverFn<
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
  resolve: DirectiveResolverFn<any, any, IContext, T>
}

export type SimplePagenatorArgs = {
  limit: number
  offset: number
}
