import { gql } from '../framework'
import { knexGql } from './schema'

async function main() {
  await knexGql.knex.raw(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)
  await knexGql.knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knexGql.knex.raw('uuid_generate_v4()'))
    t.string('name').notNullable()
  })

  const res = await knexGql.query(
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
          id: res!.data!['alice']['id'],
        },
      },
    )
    .then(console.log)

  await knexGql
    .query(
      gql`
        query ($name: String) {
          user(name: $name) {
            id
            name
          }
        }
      `,
      {
        variables: {
          name: 'alice',
        },
      },
    )
    .then(console.log)

  await knexGql.knex.destroy()
}

main()
