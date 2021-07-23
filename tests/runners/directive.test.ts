import test from 'ava'

import { gql } from '../../src'
import { users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('directive', async (t) => {
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
            hashedName
          }
        }
      `,
    )
    .then(t.snapshot)
})
