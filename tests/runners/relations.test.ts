import test from 'ava'

import { gql } from '../../src'
import { knexGql } from '../schema'
import { omitIdDeep } from '../util'

test('relations', async (t) => {
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

  t.snapshot(omitIdDeep(userRes))

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

  t.snapshot(omitIdDeep(postRes))

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
    .then(omitIdDeep)
    .then(t.snapshot)

  await knexGql
    .query(
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
    .then(omitIdDeep)
    .then(t.snapshot)

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
    .then(omitIdDeep)
    .then(t.snapshot)
})
