import { gql } from '../util'

export const definition = gql`
  directive @table(name: String!) on OBJECT
`
