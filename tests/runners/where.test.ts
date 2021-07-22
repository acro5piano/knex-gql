import test from 'ava'

import { gql } from '../../src'
import { users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('where', async (t) => {
  await knex('users').insert(users)

  await knexGql
    .query(
      gql`
        query ($id: ID) {
          user(id: $id) {
            id
            name
          }
        }
      `,
      {
        variables: {
          id: users[0]!.id,
        },
      },
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        query {
          user(name: "%Oba%") {
            id
            name
          }
        }
      `,
    )
    .then(t.snapshot)
})
