import { graphql } from 'graphql'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { IDirectiveResolvers, IResolvers } from '@graphql-tools/utils'

const gql = ([a]: TemplateStringsArray) => a!

const typeDefs = gql`
  directive @stringReplace(str: String, with: String) on FIELD_DEFINITION

  type User {
    id: ID!
    name: String! @stringReplace(str: "ka", with: "KA")
  }
  type Query {
    getUser: User!
  }
`

const directiveResolvers: IDirectiveResolvers = {
  stringReplace(next, _root, args, _ctx) {
    return next().then((name: string) => {
      return name.replace(args['str'], args['with'])
    })
  },
}

const resolvers: IResolvers = {
  Query: {
    getUser() {
      return {
        id: '78edaa01-e081-4fb4-8b58-6130be311b01',
        name: 'kazuya',
      }
    },
  },
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
})

graphql({
  schema,
  source: gql`
    query {
      getUser {
        id
        name
      }
    }
  `,
  contextValue: {
    userId: '2967ad13-2f8e-4d98-b67a-e1f3b6560d0e',
  },
}).then(console.log)
