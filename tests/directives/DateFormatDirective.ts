import dayjs from 'dayjs'

import { createFieldDirective, gql } from '../../src'

export const DateFormatDirective = createFieldDirective({
  name: 'dateFormat',
  definition: gql`
    directive @dateFormat(
      key: String!
      format: String = "YYYY-MM-DD"
    ) on FIELD_DEFINITION
  `,
  resolve: (next, root, args) => {
    return next().then((value: any) => {
      const resolvedValue = value || root
      return dayjs(resolvedValue[args['key']]).format(args['format'])
    })
  },
})
