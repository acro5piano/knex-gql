import type { Knex } from 'knex'
import {
  MapperKind,
  IDirectiveResolvers,
  getDirectives,
  mapSchema,
  getUserTypesFromSchema,
} from '@graphql-tools/utils'
import { makeExecutableSchema } from '@graphql-tools/schema'
import {
  printSchema,
  graphql,
  GraphQLType,
  // isObjectType,
  isListType,
  isNonNullType,
  GraphQLSchema,
  GraphQLObjectType,
} from 'graphql'

interface KnexGqlOptions {
  knex: Knex
  typeDefs: string
}

export class KnexGql {
  schema: GraphQLSchema
  knex: Knex
  tableNameMap = new Map<string, string>()

  constructor({ knex, typeDefs }: KnexGqlOptions) {
    this.knex = knex

    const directiveResolvers: IDirectiveResolvers = {
      stringReplace(next, _root, args) {
        return next().then((name: string) => {
          return name.replace(args['str'], args['with'])
        })
      },
      find: (_next, _root, _args, _ctx, info) => {
        const targetType = getRawType(info.returnType)
        const tableName = this.tableNameMap.get(targetType.name)
        return knex(tableName).first()
      },
    }

    // const collectTableName = (schema: GraphQLSchema) =>
    //   mapSchema(schema, {
    //     [MapperKind.OBJECT_TYPE]: (fieldConfig) => {
    //       const directives = getDirectives(schema, fieldConfig)
    //       const directiveArgumentMap = directives['table']
    //       if (directiveArgumentMap) {
    //         const { name } = directiveArgumentMap
    //         this.tableNameMap.set(fieldConfig.name, name)
    //       }
    //       return fieldConfig
    //     },
    //   })

    this.schema = makeExecutableSchema({
      typeDefs,
      directiveResolvers,
      // schemaTransforms: [collectTableName],
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

  getKnex() {
    return this.knex
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

function getRawType(type?: GraphQLType): GraphQLObjectType {
  if (!type) {
    throw new Error()
  }
  if (isNonNullType(type)) {
    return getRawType(type.ofType)
  }
  if (isListType(type)) {
    return getRawType(type.ofType)
  }
  return type as GraphQLObjectType
}
