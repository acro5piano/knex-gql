import { gql } from '../../framework'
import { posts, users } from '../fixtures'
import { init, knex } from '../knex'
import { knexGql } from '../schema'
import { log } from '../util'

async function main() {
  await init()

  await knex('users').insert(users)
  await knex('posts').insert(posts)

  // await knexGql
  //   .query(
  //     gql`
  //       query {
  //         users {
  //           id
  //           name
  //         }
  //       }
  //     `,
  //   )
  //   .then(log)

  await knexGql
    .query(
      gql`
        query {
          user(name: "Joh%") {
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
