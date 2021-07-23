import dayjs from 'dayjs'

import { createFieldDirective, gql } from '../../src'
import { DateFormatDirectiveArgs } from '../__generated__/schema'

export const DateFormatDirective = createFieldDirective<
  string,
  { [key: string]: string },
  DateFormatDirectiveArgs
>({
  name: 'dateFormat',
  definition: gql`
    directive @dateFormat(
      key: String!
      format: String = "YYYY-MM-DD"
    ) on FIELD_DEFINITION
  `,
  resolve: (next, parent, args) => {
    return next().then((value) => {
      if (value) {
        return value
      }
      return dayjs(parent[args.key]).format(args.format)
    })
  },
})
