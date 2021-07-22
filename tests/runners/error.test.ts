import test from 'ava'

import { gql } from '../../src'
import { knexGql } from '../schema'

test('error', async (t) => {
  const res = await knexGql.query(
    gql`
      mutation {
        createUser(input: { foo: "bar" }) {
          id
          name
        }
      }
    `,
  )

  t.snapshot(res)
})
