import test from 'ava'
import MockDate from 'mockdate'

import { gql } from '../../src'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('login', async (t) => {
  MockDate.set('2021-07-22T07:53:43.585Z')

  const userId = '625c6433-d903-4e40-9c29-7d0faa3a9ecb'
  await knex('users').insert({
    id: userId,
    name: 'Kay',
  })

  const UserFragment = gql`
    fragment UserFragment on User {
      id
      name
    }
  `

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
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        mutation ($userId: ID!) {
          login(userId: $userId, password: "_fake") {
            token
            user {
              ...UserFragment
            }
          }
        }
        ${UserFragment}
      `,
      {
        variables: {
          userId,
        },
      },
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        query {
          viewer {
            ...UserFragment
          }
        }
        ${UserFragment}
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
    .then(t.snapshot)
})
