import { gql } from '../../framework'
import { init, knex } from '../knex'
import { knexGql } from '../schema'
import { log } from '../util'

async function main() {
  await init()
  const userId = '625c6433-d903-4e40-9c29-7d0faa3a9ecb'
  await knex('users').insert({
    id: userId,
    name: 'Kay',
  })

  await knexGql
    .query(
      gql`
        mutation {
          login(
            userId: "a4224ecf-e4d6-4258-b5b5-0d86d04cf4db"
            password: "_fake"
          ) {
            token
          }
        }
      `,
    )
    .then(log)

  await knexGql
    .query(
      gql`
        mutation ($userId: ID!) {
          login(userId: $userId, password: "_fake") {
            token
            user {
              id
              name
            }
          }
        }
      `,
      {
        variables: {
          userId,
        },
      },
    )
    .then(log)

  await knexGql
    .query(
      gql`
        query {
          viewer {
            id
            name
          }
        }
      `,
      {
        variables: {
          userId,
        },
        context: {
          userId,
        },
      },
    )
    .then(log)

  await knexGql.knex.destroy()
}

main()
