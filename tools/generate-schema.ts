import path from 'path'

import createKnex from 'knex'

import { KnexGql, gql } from '../src'

const typeDefs = gql``

new KnexGql({
  knex: createKnex({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  }),
  typeDefs,
  emitTypeScriptDefs: path.resolve(__dirname, '../src/__generated__/schema.ts'),
})
