import test from 'ava'

import { gql } from '../../src'
import { comments, posts, users } from '../fixtures.json'
import { knex } from '../knex'
import { knexGql } from '../schema'

test('has-many-through', async (t) => {
  await knex('users').insert(users)
  await knex('posts').insert(posts)
  await knex('comments').insert(comments)
  await knexGql.prepareTableColumnsMap()
  await knexGql
    .query(
      gql`
        fragment CommentFragment on Comment {
          id
          content
        }
        query {
          user(name: "%Biden%") {
            id
            name
            posts {
              id
              title
              comments {
                ...CommentFragment
              }
            }
            comments {
              ...CommentFragment
            }
          }
        }
      `,
    )
    .then(t.snapshot)

  await knexGql
    .query(
      gql`
        fragment CommentFragment on Comment {
          id
          content
        }
        query {
          user(name: "%Biden%") {
            id
            name
            commentsSimple {
              ...CommentFragment
            }
          }
        }
      `,
    )
    .then(t.snapshot)

  t.pass()
})
