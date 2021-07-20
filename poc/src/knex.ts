import createKnex from 'knex'
import { knexLittleLogger } from 'knex-little-logger'

export const knex = createKnex({
  client: 'pg',
  connection: 'postgres://postgres:postgres@127.0.0.1:11155/postgres',
  useNullAsDefault: true,
})

knexLittleLogger(knex)
