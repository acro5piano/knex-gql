# knex-gql

[experimental] A Schema First GraphQL Query Builder for Knex.js

# Why

Creating a GraphQL service with a Relational Database is a hard thing. We should take care of:

- Performance. N+1 problem will happen if you don't use Dataloader.
- Pagination. [Dataloader pattern is hard to implement pagination](https://github.com/graphql/dataloader/issues/231) without a hacky `union` or window functions.
- Security. Keeping private fields needs much more work.
- Code Reusability. GraphQL frameworks provides the Middleware function, but it is often not enough.
- Realtime. Using GraphQL subscription is a challenging task.
- Type Safety. How to type GraphQL result without relying on Codegen?

So, why not integrate Knex with GraphQL directly?

# Getting Started

### Step 1. Install

```
yarn add knex-gql
```

### Step 2. Define GraphQL schema using SDL

```graphql
# Schema.gql

type User @table(name: "users") {
  id: ID!
  name: String!
  posts: [Post!]! @hasMany(foreignKey: "user_id")
  pageinatedPosts: [Post!]!
    @hasMany(foreignKey: "user_id", type: PAGINATOR, limit: 7)
}

input UserInput {
  name: String!
}

type Post @table(name: "posts") {
  id: ID!
  user_id: ID!
  title: String!
  user: User! @belongsTo(foreignKey: "user_id")
}

type Query {
  user(
    id: ID @where(operator: "=")
    name: String @where(operator: "LIKE")
  ): User @first
}

type Mutation {
  createUser(input: UserInput!): User! @insert
}
```

- `@table` defines which table is associated with that type.
- `@hasMany` and `belongsTo` define table relations. Relations are automatically batch loaded when executed, meaning that no N+1 problem happens.
- `@where` filters rows when these arguments are passed.
- `@first` will returns the first matching row.

### Step 3. Create `KnexGql` instance

```typescript
import { KnexGql } from 'knex-gql'
import Knex from 'knex'
import fs from 'fs/promises'

export async function getKnexGql() {
  const typeDefs = await fs.readFile('./schema.gql', 'utf8')

  const knex = Knex({
    client: 'pg',
    connection: 'postgres://postgres:postgres@127.0.0.1:11155/postgres',
  })

  const knexGql = new KnexGql({ knex, typeDefs })

  await knexGql.prepareTableColumnsMap() // This loads column info before execution

  return knexGql
}
```

### Step 4. Run Query

```typescript
import { gql } from 'knex-gql'

getKnexGql().then(async (knexGql) => {
  await knexGql
    .query(
      gql`
        mutation CreateUser {
          createUser(input: { name: "Kay" }) {
            id
            name
          }
        }
      `,
    )
    .then(console.log)
  // Output:
  // {
  //   data: {
  //     createUser: {
  //       id: 'f8f37213-060b-4b6d-843c-5fc498bcbc08',
  //       name: 'Kay'
  //     }
  //   }
  // }

  await knexGql
    .query(
      gql`
        query GetUser {
          user(name: "Kay") {
            id
            name
          }
        }
      `,
    )
    .then(console.log)
  // Output:
  // {
  //   data: {
  //     user: {
  //       id: 'f8f37213-060b-4b6d-843c-5fc498bcbc08',
  //       name: 'Kay'
  //     }
  //   }
  // }
})
```

# Features

- Automatically batch loads to avoid N+1
- Automatically select required columns based on fields set
- Middleware and custom resolver available

// Documentation todo

## Directives

| name       | description                           |
| ---------- | ------------------------------------- |
| @all       | Get all matching records              |
| @belongsTo | Get the parent record of given type   |
| @first     | Get the first matching record         |
| @hasMany   | Get child records with pagination     |
| @insert    | Insert a record into the type's table |
| @paginate  | Paginate matching records             |
| @table     | Map table and type                    |
| @where     | Add `where` clause for current query  |

For more details, please see Sample app. https://github.com/acro5piano/knex-gql-sample-app
