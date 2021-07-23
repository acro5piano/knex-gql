import { GraphQLResolveInfo } from 'graphql'

import type { IContext } from '../../interfaces'

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

export interface CreateFieldDirectiveOption<Result, Parent, Args, Context> {
  name: string
  definition: string
  resolve: DirectiveResolverFn<Result, Parent, Context, Args>
}

export function createFieldDirective<
  Result = any,
  Parent = any,
  Args = {},
  Context = IContext,
>(option: CreateFieldDirectiveOption<Result, Parent, Args, Context>) {
  return option
}
