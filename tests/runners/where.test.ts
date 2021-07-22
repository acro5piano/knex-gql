import test from 'ava'

import { gql } from '../../src'
import { posts, users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('where', async (t) => {
  await knex('users').insert(users)
  await knex('posts').insert(posts)

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

  await knexGql
    .query(
      gql`
        query {
          user(name: "%Oba%") {
            id
            name
            posts(title: "%1") {
              id
              title
            }
            pageinatedPosts(title: "%1") {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)
})
