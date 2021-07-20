import type { ExecutableSchemaTransformation } from '@graphql-tools/schema'
import { DirectiveResolverFn } from '@graphql-tools/utils'

import type { KnexGql } from './knex-gql'

export interface IDirective {
  name: string
  definition: string
  getDirectiveResolver?: (knexGql: KnexGql) => DirectiveResolverFn
  getSchemaTransformer?: (knexGql: KnexGql) => ExecutableSchemaTransformation
}
