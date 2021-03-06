import Dataloader from 'dataloader'
import { Knex } from 'knex'

import type { ISimplePagenatorArgs } from '../interfaces'

type LoaderType = 'hasMany' | 'hasManyThrough' | 'belongsTo'

interface GetLoaderProps {
  type: LoaderType
  targetTable: string
  foreignKey?: string
  through?: {
    table: string
    from: string
    to: string
  }
  page?: ISimplePagenatorArgs
  queryModifier?: (query: Knex.QueryBuilder) => void
}

interface CreateLoaderProps extends GetLoaderProps {
  knex: Knex
}

export class BatchLoader {
  private loaderMap = new Map<string, Dataloader<any, any>>()

  constructor(private knex: Knex) {}

  getLoader({
    type,
    targetTable,
    foreignKey = 'id',
    through,
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
      through,
      knex: this.knex,
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
  through,
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
    case 'hasManyThrough':
      if (!through) {
        throw new Error('no `through` key found')
      }
      if (page) {
        return new Dataloader((ids: readonly string[]) => {
          const query = knex(
            knex(targetTable)
              .select(`${targetTable}.*`, `${through.table}.${through.from}`)
              .rowNumber('relation_index', `${through.table}.id`, through.from) // TODO: make order by enable
              .innerJoin(
                through.table,
                `${through.table}.id`,
                `${targetTable}.${through.to}`,
              )
              .whereIn(through.from, ids)
              .as('_t'),
          ).whereBetween(knex.ref('relation_index') as any, [
            page.offset,
            page.offset + page.limit,
          ])
          if (queryModifier) {
            queryModifier(query)
          }
          return query.then((rows) =>
            ids.map((id) => rows.filter((row) => row[through.from] === id)),
          )
        })
      } else {
        return new Dataloader((ids: readonly string[]) => {
          const query = knex(
            knex(targetTable)
              .select(`${targetTable}.*`, `${through.table}.${through.from}`)
              .innerJoin(
                through.table,
                `${through.table}.id`,
                `${targetTable}.${through.to}`,
              )
              .whereIn(through.from, ids)
              .as('_t'),
          )
          if (queryModifier) {
            queryModifier(query)
          }
          return query.then((rows) =>
            ids.map((id) => rows.filter((row) => row[through.from] === id)),
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
