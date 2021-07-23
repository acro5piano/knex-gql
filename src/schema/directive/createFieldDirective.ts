import type { IDirectiveResolverFn, KnexGqlContext } from '../../interfaces'

export interface CreateFieldDirectiveOption<Result, Parent, Args, Context> {
  name: string
  definition: string
  resolve: IDirectiveResolverFn<Result, Parent, Context, Args>
}

export function createFieldDirective<
  Result = any,
  Parent = any,
  Args = {},
  Context = KnexGqlContext,
>(option: CreateFieldDirectiveOption<Result, Parent, Args, Context>) {
  return option
}
