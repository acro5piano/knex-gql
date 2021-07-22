import { GraphQLDateTime } from 'graphql-scalars'

import { gql } from '../util'

export const defaultSchema = gql`
  scalar DateTime
`

export const resolveFunctions = {
  DateTime: GraphQLDateTime,
}
