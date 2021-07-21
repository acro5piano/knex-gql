import { gql } from '../../framework'
import { init } from '../knex'
import { knexGql } from '../schema'
import { log } from '../util'

async function main() {
  await init()

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

  await knexGql.query(
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

  await knexGql.knex.destroy()
}

main()
