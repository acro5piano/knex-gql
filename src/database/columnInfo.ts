import { Knex } from 'knex'

interface DatabaseTableInfo {
  name: string
  columns: string[]
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
      }
    }),
  )
}
