import type { ExecutableSchemaTransformation } from '@graphql-tools/schema'
import type { DirectiveResolverFn } from '@graphql-tools/utils'

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
