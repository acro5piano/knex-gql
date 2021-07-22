import type { ExecutableSchemaTransformation } from '@graphql-tools/schema'
import type { DirectiveResolverFn, IFieldResolver } from '@graphql-tools/utils'

import type { BatchLoader } from './execution/BatchLoader'
import type { KnexGql } from './knex-gql'

export interface IContext {
  batchLoader: BatchLoader
}

export interface IDirective {
  name: string
  definition: string
  getDirectiveResolver?: (
    knexGql: KnexGql,
  ) => DirectiveResolverFn<any, IContext>
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

export interface ICustomFieldDirective {
  name: string
  definition: string
  resolve: DirectiveResolverFn<any, IContext>
}
