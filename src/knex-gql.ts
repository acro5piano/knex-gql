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
  ICustomFieldDirective,
  ICustomFieldResolver,
  ICustomResoverFn,
  IExecutionOption,
} from './interfaces'
import { defaultSchema, resolveFunctions } from './schema'
import { TypeScriptSchemaGetter } from './typegen'

type ErrorHandler = (errors: ReadonlyArray<GraphQLError>) => any

interface KnexGqlOptions {
  knex: Knex
  typeDefs: string
  directiveResolvers?: ICustomFieldDirective[]
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
    directiveResolvers: givenDirectiveResolvers = [],
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

    const customDirectiveTypeDefs = givenDirectiveResolvers.map(
      (directive) => directive.definition,
    )

    const customDirectiveResolvers = givenDirectiveResolvers.reduce(
      (resolvers, directive) => {
        return {
          ...resolvers,
          [directive.name]: directive.resolve,
        }
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
      typeDefs: [
        defaultSchema,
        ...presetsDirectiveTypeDefs,
        ...customDirectiveTypeDefs,
        typeDefs,
      ],
      directiveResolvers: {
        ...customDirectiveResolvers,
      },
      schemaTransforms: [...presetsSchemaTransforms],
      resolvers: resolveFunctions,
    })
  }

  schemaToString() {
    return printSchema(this.schema)
  }

  schemaToTypeScriptSchema() {
    return new TypeScriptSchemaGetter(this.schema).getCode()
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
