import test from 'ava'

import { gql } from '../../src'
import { posts, users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('paginate-relation', async (t) => {
  await knex('users').insert(users)
  await knex('posts').insert(posts)

  await knexGql
    .query(
      gql`
        query {
          users(name: "Joh%") {
            id
            name
            pageinatedPosts(title: "% - 1") {
              id
              title
            }
          }
        }
      `,
    )
    .then(log)

  await knexGql
    .query(
      gql`
        query {
          users(name: "Joh%") {
            id
            name
            pageinatedPosts(title: "% - 1") {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)
})
