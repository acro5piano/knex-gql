import { gql } from '../../framework'
import { init } from '../knex'
import { knexGql } from '../schema'
import { log } from '../util'

async function main() {
  await init()

  const aliceId = await knexGql
    .query(
      gql`
        mutation {
          bob: createUser(input: { name: "bob" }) {
            id
            name
          }
          alice: createUser(input: { name: "alice" }) {
            id
            name
          }
        }
      `,
    )
    .then((res) => res!.data!['alice']['id'])

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
          id: aliceId,
        },
      },
    )
    .then(log)

  await knexGql
    .query(
      gql`
        query {
          user(name: "ali%") {
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
