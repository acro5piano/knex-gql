import test from 'ava'

import { gql } from '../../src'
import { users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('paginate', async (t) => {
  await knex('users').insert(users)

  await knexGql
    .query(
      gql`
        query {
          users {
            id
            name
            createdAt
            createdOn
            createdOnDayOfWeek
          }
        }
      `,
    )
    .then(t.snapshot)
})
