import Dataloader from 'dataloader'
import { Knex } from 'knex'

import type { KnexGql } from '../knex-gql'

type LoaderType = 'hasMany' | 'belongsTo'

type Page = {
  limit: number
  offset: number
}

export class BatchLoader {
  private loaderMap = new Map<string, Dataloader<any, any>>()

  constructor(private knexGql: KnexGql) {}

  getLoader(
    type: LoaderType,
    targetTable: string,
    foreignKey = 'id',
    page?: Page,
  ) {
    const key = `${type}:${targetTable}:${foreignKey}:${
      page ? `${page.limit}:${page.offset}` : ''
    }`
    const maybeLoader = this.loaderMap.get(key)
    if (maybeLoader) {
      return maybeLoader
    }
    const loader = createLoader(
      type,
      targetTable,
      foreignKey,
      this.knexGql.knex,
      page,
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
  page?: Page,
) {
  switch (type) {
    case 'hasMany':
      if (page) {
        return new Dataloader((ids: readonly string[]) =>
          knex(
            knex(targetTable)
              .select('*')
              .rowNumber('relation_index', 'id', foreignKey) // TODO: make order by enable
              .whereIn(foreignKey, ids)
              .as('_t'),
          )
            .whereBetween(knex.ref('relation_index') as any, [
              page.offset,
              page.offset + page.limit,
            ])
            .then((rows) =>
              ids.map((id) => rows.filter((row) => row[foreignKey] === id)),
            ),
        )
      } else {
        return new Dataloader((ids: readonly string[]) =>
          knex(targetTable)
            .whereIn(foreignKey, ids)
            .then((rows) =>
              ids.map((id) => rows.filter((row) => row[foreignKey] === id)),
            ),
        )
      }
    case 'belongsTo':
      return new Dataloader((ids: readonly string[]) =>
        knex(targetTable)
          .whereIn('id', ids)
          .then((rows) => ids.map((id) => rows.find((row) => row.id === id))),
      )
  }
}
