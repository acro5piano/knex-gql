import Dataloader from 'dataloader'
import { Knex } from 'knex'

import type { ISimplePagenatorArgs } from '../interfaces'
import type { KnexGql } from '../knex-gql'

type LoaderType = 'hasMany' | 'belongsTo'

interface GetLoaderProps {
  type: LoaderType
  targetTable: string
  foreignKey?: string
  page?: ISimplePagenatorArgs
  queryModifier?: (query: Knex.QueryBuilder) => void
}

interface CreateLoaderProps extends GetLoaderProps {
  knex: Knex
}

export class BatchLoader {
  private loaderMap = new Map<string, Dataloader<any, any>>()

  constructor(private knexGql: KnexGql) {}

  getLoader({
    type,
    targetTable,
    foreignKey = 'id',
    page,
    queryModifier,
  }: GetLoaderProps) {
    const key = `${type}:${targetTable}:${foreignKey}:${
      page ? `${page.limit}:${page.offset}` : ''
    }`
    const maybeLoader = this.loaderMap.get(key)
    if (maybeLoader) {
      return maybeLoader
    }
    const loader = createLoader({
      type,
      targetTable,
      foreignKey,
      knex: this.knexGql.knex,
      page,
      queryModifier,
    })
    this.loaderMap.set(key, loader)
    return loader
  }
}

function createLoader({
  type,
  targetTable,
  foreignKey = 'id',
  page,
  knex,
  queryModifier,
}: CreateLoaderProps) {
  switch (type) {
    case 'hasMany':
      if (page) {
        return new Dataloader((ids: readonly string[]) => {
          const query = knex(
            knex(targetTable)
              .select('*')
              .rowNumber('relation_index', 'id', foreignKey) // TODO: make order by enable
              .whereIn(foreignKey, ids)
              .as('_t'),
          ).whereBetween(knex.ref('relation_index') as any, [
            page.offset,
            page.offset + page.limit,
          ])
          if (queryModifier) {
            queryModifier(query)
          }
          return query.then((rows) =>
            ids.map((id) => rows.filter((row) => row[foreignKey] === id)),
          )
        })
      } else {
        return new Dataloader((ids: readonly string[]) => {
          const query = knex(targetTable).whereIn(foreignKey, ids)
          if (queryModifier) {
            queryModifier(query)
          }
          return query.then((rows) =>
            ids.map((id) => rows.filter((row) => row[foreignKey] === id)),
          )
        })
      }
    case 'belongsTo':
      return new Dataloader((ids: readonly string[]) => {
        const query = knex(targetTable).whereIn('id', ids)
        if (queryModifier) {
          queryModifier(query)
        }
        return query.then((rows) =>
          ids.map((id) => rows.find((row) => row.id === id)),
        )
      })
  }
}
