import {
  ExecutableSchemaTransformation,
  makeExecutableSchema,
} from '@graphql-tools/schema'
import { IDirectiveResolvers } from '@graphql-tools/utils'
import { GraphQLError, GraphQLSchema, graphql, printSchema } from 'graphql'
import type { Knex } from 'knex'

import { directives } from './directives'
import { BatchLoader } from './execution/BatchLoader'
import type {
  IContext,
  ICustomFieldResolver,
  ICustomResoverFn,
  IExecutionOption,
} from './interfaces'

type ErrorHandler = (errors: ReadonlyArray<GraphQLError>) => any

interface KnexGqlOptions {
  knex: Knex
  typeDefs: string
  directiveResolvers?: IDirectiveResolvers
  errorHandler?: ErrorHandler
  fieldResolvers?: ICustomFieldResolver[]
}

export class KnexGql {
  schema: GraphQLSchema
  knex: Knex
  tableNameMap = new Map<string, string>()
  resolverMap = new Map<string, ICustomResoverFn<any, IContext, any>>()
  errorHandler?: ErrorHandler

  constructor({
    knex,
    typeDefs,
    directiveResolvers: givenDirectiveResolvers,
    errorHandler,
    fieldResolvers = [],
  }: KnexGqlOptions) {
    this.knex = knex
    this.errorHandler = errorHandler

    fieldResolvers.forEach((resolver) => {
      this.resolverMap.set(resolver.name, resolver.resolve)
    })

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

  async query(source: string, options: IExecutionOption = {}) {
    const result = await graphql({
      schema: this.schema,
      source,
      variableValues: options.variables,
      contextValue: {
        batchLoader: new BatchLoader(this),
        ...(options.context || {}),
      },
    })
    if (result.errors && this.errorHandler) {
      this.errorHandler(result.errors)
    }
    return result
  }
}
