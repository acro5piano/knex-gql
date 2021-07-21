import { gql } from '../framework'
import { knexGql } from './schema'

async function createSchema() {
  await knexGql.knex.raw(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `)
  await knexGql.knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knexGql.knex.raw('uuid_generate_v4()'))
    t.string('name').notNullable()
  })
  await knexGql.knex.schema.createTable('posts', (t) => {
    t.uuid('id').primary().defaultTo(knexGql.knex.raw('uuid_generate_v4()'))
    t.uuid('user_id').notNullable().references('users.id').onDelete('CASCADE')
    t.string('title').notNullable()
  })
}

const log = (a: any) => console.log(JSON.stringify(a, undefined, 2))

async function main() {
  await createSchema()

  const userRes = await knexGql.query(
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

  const aliceId = userRes!.data!['alice']['id']

  const postRes = await knexGql.query(
    gql`
      mutation ($userId: ID!) {
        createPost(input: { user_id: $userId, title: "Hello World!" }) {
          id
          title
        }
      }
    `,
    {
      variables: {
        userId: aliceId,
      },
    },
  )

  const postId = postRes!.data!['createPost']['id']

  await knexGql
    .query(
      gql`
        query {
          allUsers {
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
    .then(log)

  await knexGql.query(
    gql`
      query ($id: ID) {
        user(id: $id) {
          id
          name
          posts {
            id
            title
          }
        }
      }
    `,
    {
      variables: {
        id: aliceId,
      },
    },
  )

  await knexGql
    .query(
      gql`
        query ($id: ID!) {
          post(id: $id) {
            id
            title
            user {
              id
              name
            }
          }
        }
      `,
      {
        variables: {
          id: postId,
        },
      },
    )
    .then(log)

  await knexGql.knex.destroy()
}

main()
