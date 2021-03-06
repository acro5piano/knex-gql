import fs from 'fs/promises'

import {
  ExecutableSchemaTransformation,
  makeExecutableSchema,
} from '@graphql-tools/schema'
import {
  IDirectiveResolvers,
  IResolvers,
  getUserTypesFromSchema,
} from '@graphql-tools/utils'
import { GraphQLError, GraphQLSchema, graphql, printSchema } from 'graphql'
import type { Knex } from 'knex'

import { DatabaseTableInfo, getColumnInfo } from './database/columnInfo'
import { directives } from './directives'
import { BatchLoader } from './execution/BatchLoader'
import type {
  ICustomFieldDirective,
  ICustomFieldResolver,
  ICustomResoverFn,
  IExecutionOption,
  KnexGqlContext,
} from './interfaces'
import { defaultSchema, resolveFunctions } from './schema/defaultSchema'
import { TypeScriptSchemaGetter } from './typegen'
import { getMapValues, keys } from './util'

type ErrorHandler = (errors: ReadonlyArray<GraphQLError>) => any

interface EmitTypeScriptDefsOption {
  path: string
  moduleName?: string
}

interface KnexGqlOptions {
  knex: Knex
  typeDefs: string
  directiveResolvers?: ICustomFieldDirective<any>[]
  errorHandler?: ErrorHandler
  fieldResolvers?: ICustomFieldResolver[]
  emitSchema?: boolean | string
  emitTypeScriptDefs?: boolean | string | EmitTypeScriptDefsOption
  resolvers?: IResolvers
}

export class KnexGql {
  schema: GraphQLSchema
  knex: Knex
  tableNameMap = new Map<string, string>()
  tableColumnsMap = new Map<string, DatabaseTableInfo>()
  resolverMap = new Map<string, ICustomResoverFn<any, KnexGqlContext, any>>()
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
      let fileName = 'schema.ts'
      let moduleName: string | undefined = 'knex-gql'
      if (typeof emitTypeScriptDefs === 'string') {
        fileName = emitTypeScriptDefs
      }
      if (typeof emitTypeScriptDefs === 'object') {
        fileName = emitTypeScriptDefs.path
        moduleName = emitTypeScriptDefs.moduleName
      }
      fs.writeFile(fileName, this.schemaToTypeScriptSchema(moduleName), 'utf8')
    }
  }

  schemaToString() {
    return printSchema(this.schema)
  }

  schemaToTypeScriptSchema(moduleName = 'knex-gql') {
    return new TypeScriptSchemaGetter(this.schema, moduleName).getCode()
  }

  async prepareTableColumnsMap() {
    const infos = await getColumnInfo(
      this.knex,
      getMapValues(this.tableNameMap),
    )
    getUserTypesFromSchema(this.schema).map((type) => {
      const fields = type.getFields()
      keys(fields).map((key) => {
        const field = fields[key]
        const relationDirective = field?.astNode?.directives?.find(
          (directive) =>
            directive.name.value === 'hasMany' ||
            directive.name.value === 'belongsTo',
        )
        if (relationDirective) {
          const foreignKey = relationDirective?.arguments?.find(
            (arg) => arg.name.value === 'foreignKey',
          )
          if (foreignKey?.value?.kind === 'StringValue') {
            infos
              .find((info) => info.name === key)
              ?.referenceColumns?.push(foreignKey?.value?.value)
          }
        }
      })
    })
    infos.forEach((info) => {
      this.tableColumnsMap.set(info.name, info)
    })
  }

  async query(source: string, options: IExecutionOption = {}) {
    const result = await graphql({
      schema: this.schema,
      source,
      variableValues: options.variables,
      contextValue: this.mergeKnexGqlContext(() => ({
        ...(options.context || {}),
      })),
    })
    if (result.errors && this.errorHandler) {
      this.errorHandler(result.errors)
    }
    return result
  }

  mergeKnexGqlContext<T>(givenCtx: T) {
    return {
      batchLoader: new BatchLoader(this.knex),
      ...(typeof givenCtx === 'function' ? givenCtx() : givenCtx),
    }
  }
}
