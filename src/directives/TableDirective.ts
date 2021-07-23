import { TableDirectiveArgs } from '../__generated__/schema'
import { createObjectTypeManipulator } from '../schema/directive/createObjectTypeManipulator'
import { gql } from '../util'

export const TableDirective = createObjectTypeManipulator<TableDirectiveArgs>({
  name: 'table',
  definition: gql`
    directive @table(name: String!) on OBJECT
  `,
  schemaMapper: ({ knexGql, directiveArgumentMap, type }) => {
    knexGql.tableNameMap.set(type.name, directiveArgumentMap.name)
    return type
  },
})
