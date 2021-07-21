import Dataloader from 'dataloader'
import { Knex } from 'knex'

import type { KnexGql } from '../knex-gql'

type LoaderType = 'hasMany' | 'belongsTo'

export class BatchLoader {
  private loaderMap = new Map<string, Dataloader<any, any>>()

  constructor(private knexGql: KnexGql) {}

  getLoader(type: LoaderType, targetTable: string, foreignKey = 'id') {
    const key = `${type}:${targetTable}:${foreignKey}`
    const maybeLoader = this.loaderMap.get(key)
    if (maybeLoader) {
      return maybeLoader
    }
    const loader = createLoader(
      type,
      targetTable,
      foreignKey,
      this.knexGql.knex,
    )
    this.loaderMap.set(key, loader)
    return loader
  }
}

function createLoader(
  type: LoaderType,
  targetTable: string,
  foreignKey: string,
  knex: Knex,
) {
  switch (type) {
    case 'hasMany':
      return new Dataloader((ids: readonly string[]) =>
        knex(targetTable)
          .whereIn(foreignKey, ids)
          .then((rows) =>
            ids.map((id) => rows.filter((row) => row[foreignKey] === id)),
          ),
      )
    case 'belongsTo':
      return new Dataloader((ids: readonly string[]) =>
        knex(targetTable)
          .whereIn('id', ids)
          .then((rows) => ids.map((id) => rows.find((row) => row.id === id))),
      )
  }
}
