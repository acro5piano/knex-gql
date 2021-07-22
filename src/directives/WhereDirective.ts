import { IDirective } from '../interfaces'
import { gql } from '../util'

export const WhereDirective: IDirective = {
  name: 'where',
  definition: gql`
    directive @where(operator: String = "=") on ARGUMENT_DEFINITION
  `,
}
