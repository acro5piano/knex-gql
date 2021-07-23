import test from 'ava'

import { knex, knexWithLog } from './knex'
import { knexGql } from './schema'
import { log } from './util'

test.beforeEach((t) => {
  console.log('\n===========================')
  console.log(t.title.replace('beforeEach hook for ', '  '))
  console.log('===========================\n')
})

test.before(async () => {
  Object.assign(global, { log }) // shorthand
  await knex.raw(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.string('name').notNullable()
    t.string('email')
    t.timestamps(true, true)
  })
  await knex.schema.createTable('posts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE')
    t.string('title').notNullable()
    t.timestamps(true, true)
  })
  await knex.schema.createTable('comments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('post_id').notNullable().references('posts.id').onDelete('CASCADE')
    t.string('content').notNullable()
    t.timestamps(true, true)
  })
  await knexGql.prepareTableColumnsMap()
})

test.after(async () => {
  await knexWithLog.destroy()
  await knex.destroy()
})
