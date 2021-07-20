import { IDirective } from '../interfaces'
import { getRawType } from '../util'
import { gql } from '../util'

export const FindDirective: IDirective = {
  name: 'find',
  definition: gql`
    directive @find on FIELD_DEFINITION
  `,
  getDirectiveResolver: (knexGql) => {
    return function findDirective(_next, _root, _args, _ctx, info) {
      const targetType = getRawType(info.returnType)
      const tableName = knexGql.tableNameMap.get(targetType.name)
      return knexGql.knex(tableName).first()
    }
  },
}
