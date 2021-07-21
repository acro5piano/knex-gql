# knex-graphql

[experimental] A Schema First GraphQL Query Builder for Knex.js

# Why

Creating a GraphQL service with a Relational Database is a hard thing. We should take care of:

- Performance. N+1 problem will happen if you don't use Dataloader
- Pagination. Dataloader pattern is hard to implement pagination without a hacky `union` or window functions.
- Security. Keeping private fields needs much more work.
- Code Reusability. GraphQL frameworks provides the Middleware function, but it is often not enough.
- Realtime. Using GraphQL subscription is a challenging task.
- Type Safety. How to type GraphQL result without relying on Codegen?

So, why not integrate Knex with GraphQL directly?

# POC

## tl;dr

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

input PostInput {
  user_id: ID!
  title: String!
}

type LoginPayload {
  token: String!
  user: User!
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

```typescript
const typeDefs = fs.readFileSync('./schema.gql')

const knexGql = new KnexGql({ knex, typeDefs })

await knexGql.query(gql`
  mutation CreateUser {
    createUser(input: { name: "Kay" }) {
      id
      name
    }
  }
`).then(console.log)

// {
//   data: {
//     createUser: {
//       id: 'f8f37213-060b-4b6d-843c-5fc498bcbc08',
//       name: 'Kay'
//     }
//   }
// }

await knexGql.query(gql`
  query GetUser {
    user(name: "Kay") {
      id
      name
    }
  }
`).then(console.log)

// {
//   data: {
//     user: {
//       id: 'f8f37213-060b-4b6d-843c-5fc498bcbc08',
//       name: 'Kay'
//     }
//   }
// }


```

## Directives

| name        | description                           |
| ----------- | ------------------------------------- |
| all         | Get all matching records              |
| belongsTo   | Get the parent record of given type   |
| first       | Get the first matching record         |
| hasMany     | Get child records with pagination     |
| insert      | Insert a record into the type's table |
| paginate    | Paginate matching records             |
| table       | Map table and type                    |
| useResolver | Declare to use a custom resolver      |
| where       | Add `where` clause for current query  |
