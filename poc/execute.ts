import { knexGql } from './schema'
import { gql } from './util'

async function main() {
  await knexGql.knex.schema.createTable('users', (t) => {
    t.uuid('id').unique()
    t.string('name').notNullable()
  })

  await knexGql
    .query(
      gql`
        mutation {
          createUser(
            input: {
              id: "d30e4bd4-e143-43ba-aee5-967df1784bab"
              name: "kazuya"
            }
          ) {
            id
            name
          }
        }
      `,
    )
    .then(console.log)

  await knexGql
    .query(
      gql`
        query {
          user {
            id
            name
          }
        }
      `,
    )
    .then(console.log)

  await knexGql.knex.destroy()
}

main()
