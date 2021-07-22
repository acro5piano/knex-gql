import createKnex from 'knex'
import { knexLittleLogger } from 'knex-little-logger'

const knexStringcase = require('knex-stringcase')

export const knex = createKnex(
  knexStringcase({
    client: 'pg',
    connection: 'postgres://postgres:postgres@127.0.0.1:11155/postgres',
    useNullAsDefault: true,
  }),
)

knexLittleLogger(knex)

export async function init() {
  await knex.raw(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.string('name').notNullable()
  })
  await knex.schema.createTable('posts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE')
    t.string('title').notNullable()
  })
}
