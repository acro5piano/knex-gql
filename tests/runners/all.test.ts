import test from 'ava'

import { gql } from '../../src'
import { users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('all', async (t) => {
  await knex('users').insert(users.slice(0, 10))
  await knexGql.prepareTableColumnsMap()
  await knexGql
    .query(
      gql`
        query {
          allUsers {
            id
            posts {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)
})
