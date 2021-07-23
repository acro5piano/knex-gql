import fs from 'fs/promises'

import {
  ExecutableSchemaTransformation,
  makeExecutableSchema,
} from '@graphql-tools/schema'
import { IDirectiveResolvers, IResolvers } from '@graphql-tools/utils'
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
  emitSchema?: boolean | string
  emitTypeScriptDefs?: boolean | string
  resolvers?: IResolvers
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
    emitSchema = false,
    emitTypeScriptDefs = false,
    resolvers = {},
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
      resolvers: [resolvers, resolveFunctions],
    })

    if (emitSchema !== false) {
      const fileName = emitSchema === true ? 'schema.gql' : emitSchema
      fs.writeFile(fileName, this.schemaToString(), 'utf8')
    }

    if (emitTypeScriptDefs !== false) {
      const fileName =
        emitTypeScriptDefs === true ? 'schema.ts' : emitTypeScriptDefs
      fs.writeFile(fileName, this.schemaToTypeScriptSchema(), 'utf8')
    }
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
