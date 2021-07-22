import type { DirectiveResolverFn } from '@graphql-tools/utils'

import type { IContext } from '../../interfaces'

export interface CreateFieldDirectiveOption {
  name: string
  definition: string
  resolve: DirectiveResolverFn<any, IContext>
}

export function createFieldDirective(option: CreateFieldDirectiveOption) {
  return option
}
