import {
  ExecutableSchemaTransformation,
  makeExecutableSchema,
} from '@graphql-tools/schema'
import { IDirectiveResolvers } from '@graphql-tools/utils'
import { GraphQLSchema, graphql, printSchema } from 'graphql'
import type { Knex } from 'knex'

import { directives } from './directives'
import { BatchLoader } from './execution/BatchLoader'
import { IExecutionOption } from './interfaces'

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

    const presetsDirectiveTypeDefs = directives.map(
      (directive) => directive.definition,
    )

    const presetsDirectiveResolvers = directives.reduce(
      (resolvers, directive) => {
        if (directive.getDirectiveResolver) {
          return {
            ...resolvers,
            [directive.name]: directive.getDirectiveResolver(this),
          }
        }
        return resolvers
      },
      {} as IDirectiveResolvers,
    )

    const presetsSchemaTransforms = directives.reduce(
      (transformers, directive) => {
        if (directive.getSchemaTransformer) {
          return [...transformers, directive.getSchemaTransformer(this)]
        }
        return transformers
      },
      [] as ExecutableSchemaTransformation[],
    )

    this.schema = makeExecutableSchema({
      typeDefs: [...presetsDirectiveTypeDefs, typeDefs],
      directiveResolvers: {
        ...presetsDirectiveResolvers,
        ...givenDirectiveResolvers,
      },
      schemaTransforms: [...presetsSchemaTransforms],
    })
  }

  schemaToString() {
    return printSchema(this.schema)
  }

  query(source: string, options: IExecutionOption = {}) {
    return graphql({
      schema: this.schema,
      source,
      variableValues: options.variables,
      contextValue: {
        batchLoader: new BatchLoader(this),
        userId: '2967ad13-2f8e-4d98-b67a-e1f3b6560d0e', // TODO
      },
    })
  }
}
