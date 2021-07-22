import dayjs from 'dayjs'

import { createFieldDirective, gql } from '../../src'

export const DateFormatDirective = createFieldDirective({
  name: 'dateFormat',
  definition: gql`
    directive @dateFormat(format: String = "YYYY-MM-DD") on FIELD_DEFINITION
  `,
  resolve: (next, _root, args) => {
    return next().then((value: string) => {
      return dayjs(value).format(args['format'])
    })
  },
})
