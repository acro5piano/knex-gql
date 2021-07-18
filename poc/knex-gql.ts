import type { Knex } from 'knex'
import {
  IDirectiveResolvers,
  getDirectives,
  getUserTypesFromSchema,
} from '@graphql-tools/utils'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { printSchema, graphql, GraphQLSchema } from 'graphql'
import * as findDirective from './directives/find'
import * as tableDirective from './directives/table'
import * as createDirective from './directives/create'

interface KnexGqlOptions {
  knex: Knex
  typeDefs: string
  directiveResolvers?: IDirectiveResolvers
}

export class KnexGql {
  schema: GraphQLSchema
  knex: Knex
  tableNameMap = new Map<string, string>()

  constructor({
    knex,
    typeDefs,
    directiveResolvers: givenDirectiveResolvers,
  }: KnexGqlOptions) {
    this.knex = knex

    const directiveResolvers: IDirectiveResolvers = {
      find: findDirective.factory(this),
      ...givenDirectiveResolvers,
    }

    this.schema = makeExecutableSchema({
      typeDefs: [
        createDirective.definition,
        tableDirective.definition,
        findDirective.definition,
        typeDefs,
      ],
      directiveResolvers,
      schemaTransforms: [createDirective.factorySchemaTransformer(this)],
    })

    const types = getUserTypesFromSchema(this.schema)
    types.forEach((type) => {
      const directives = getDirectives(this.schema, type)
      const directiveArgumentMap = directives['table']
      if (directiveArgumentMap) {
        const { name } = directiveArgumentMap
        this.tableNameMap.set(type.name, name)
      }
    })
  }

  schemaToString() {
    return printSchema(this.schema)
  }

  query(source: string) {
    return graphql({
      schema: this.schema,
      source,
      contextValue: {
        userId: '2967ad13-2f8e-4d98-b67a-e1f3b6560d0e',
      },
    })
  }
}
