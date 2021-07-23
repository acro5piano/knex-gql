import { Knex } from 'knex'

export interface DatabaseTableInfo {
  name: string
  columns: string[]
  referenceColumns: string[]
}

export async function getColumnInfo(
  knex: Knex,
  tableNames: string[],
): Promise<DatabaseTableInfo[]> {
  return Promise.all(
    tableNames.map(async (tableName) => {
      const rawColumns = await knex(tableName).columnInfo()
      return {
        name: tableName,
        columns: Object.keys(rawColumns),
        referenceColumns: [],
      }
    }),
  )
}
