import { gql } from '../../framework'
import { posts, users } from '../fixtures'
import { init, knex } from '../knex'
import { knexGql } from '../schema'
import { log } from '../util'

async function main() {
  await init()

  await knex('users').insert(users)
  await knex('posts').insert(posts)

  await knexGql.query(
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

  await knexGql.query(
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
    .then(log)

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
    .then(log)

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
    .then(log)

  await knexGql.knex.destroy()
}

main()
