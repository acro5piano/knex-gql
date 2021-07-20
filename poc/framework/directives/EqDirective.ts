import { IDirective } from '../interfaces'
import { gql } from '../util'

export const EqDirective: IDirective = {
  name: 'eq',
  definition: gql`
    directive @eq on ARGUMENT_DEFINITION
  `,
}
