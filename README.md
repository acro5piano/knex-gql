# knex-graphql

[experimental] A GraphQL Query Builder using Knex.js

# Spec

This is just README. No implementation. Just a concept.

### Basic

```typescript
import { gql, createKnexGraphQL } from 'knex-graphql'
import createKnex from 'knex'

const knex = createKnex({
  client: 'pg',
  connection: 'postgres://postgres:postgres@127.0.0.1:5432/postgres',
})

const schema = gql`
  type User {
    id: ID!
    name: String!
  }
  input UserInput {
    name: String
  }
`

const { query } = createKnexGraphQL({
  knex,
  schema,
})

async function mutate() {
  await query(
    gql`
      mutation ($input: UserInput!) {
        insertUser(object: $input) {
          returning {
            id
            name
          }
        }
      }
    `,
    {
      variables: {
        input: {
          name: 'Kay',
        },
      },
    },
  )
}

async function query() {
  return query(gql`
    query {
      users {
        id
        name
      }
    }
  `)
}

async function main() {
  await mutate()
  const { data } = await query()
  console.log(data)
  // outputs:
  //
  // {
  //   data: {
  //     insertUser: {
  //       returning: {
  //         id: 1,
  //         name: 'Kay',
  //       },
  //     }
  //   }
  // }
}
```

### With HTTP layer

In this example we use `fastify`, but anything can be here.

```typescript
import { GraphORM, gql } from '@graph-orm/core'
import Fastify from 'fastify'

const orm = new GraphORM({
  connection: 'postgres://postgres:postgres@127.0.0.1:5432/postgres',
})

const app = Fastify()

app.post('/graphql', (request, reply) => {
  const { query, variables } = request.body
  return orm.graphql(query, { variables })
})

app.listen(8080)
```
