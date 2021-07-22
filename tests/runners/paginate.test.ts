import test from 'ava'

import { gql } from '../../src'
import { posts, users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('paginate', async (t) => {
  await knex('users').insert(users)
  await knex('posts').insert(posts)

  await knexGql
    .query(
      gql`
        query {
          users(name: "Joh%") {
            id
            name
            posts {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        query {
          users(name: "%jam%", page: 2) {
            id
            name
            posts {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        query {
          users(name: "%Bi%") {
            id
            name
            pageinatedPosts(page: 1) {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        query {
          users(name: "%Bi%") {
            id
            name
            pageinatedPosts(page: 2) {
              id
              title
            }
          }
        }
      `,
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        query {
          firstUser {
            id
            name
          }
        }
      `,
    )
    .then(t.snapshot)
})
