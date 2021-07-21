import { gql } from '../../framework'
import { init } from '../knex'
import { knexGql } from '../schema'

async function main() {
  await init()

  await knexGql.query(
    gql`
      mutation {
        createUser(input: { foo: "bar" }) {
          id
          name
        }
      }
    `,
  )

  await knexGql.knex.destroy()
}

main()
