import Dataloader from 'dataloader'

import type { KnexGql } from '../knex-gql'

type LoaderType = 'hasMany'

export class BatchLoader {
  private loaderMap = new Map<string, Dataloader<any, any>>()

  constructor(private knexGql: KnexGql) {}

  getLoader(type: LoaderType, targetTable: string, foreignKey: string) {
    const key = `${type}:${targetTable}:${foreignKey}`
    const maybeLoader = this.loaderMap.get(key)
    if (maybeLoader) {
      return maybeLoader
    }
    const loader = new Dataloader((ids: readonly string[]) =>
      this.knexGql
        .knex(targetTable)
        .whereIn(foreignKey, ids)
        .then((rows) =>
          ids.map((id) => rows.filter((row) => row[foreignKey] === id)),
        ),
    )
    this.loaderMap.set(key, loader)
    return loader
  }

  postsByUserId = new Dataloader((ids: readonly string[]) =>
    this.knexGql
      .knex('posts')
      .whereIn('user_id', ids)
      .then((rows) =>
        ids.map((id) => rows.filter((row) => row.user_id === id)),
      ),
  )
}
