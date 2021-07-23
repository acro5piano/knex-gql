import { getDocumentNodeFromSchema } from '@graphql-tools/utils'
import {
  DirectiveDefinitionNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql'

export class TypeScriptSchemaGetter {
  code = `/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { KnexGqlContext } from 'knex-gql'

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
}
  `
  argumentCode = ''
  resolversCode = ''
  allResolverCode = 'export interface Resolvers {'

  constructor(private schema: GraphQLSchema) {}

  getCode() {
    this.code += this.getTypeScriptSchema()
    return (
      this.code +
      '\n\n' +
      this.argumentCode +
      '\n\n' +
      this.resolversCode +
      '\n\n' +
      this.allResolverCode +
      '\n}'
    )
  }

  getTypeScriptSchema() {
    const nodes = getDocumentNodeFromSchema(this.schema)
    return nodes.definitions.reduce((code, node) => {
      if (!node) {
        return ''
      }
      if (node.kind === 'DirectiveDefinition') {
        return code + this.directiveToTs(node)
      }
      if (node.kind === 'EnumTypeDefinition') {
        return code + this.enumToTs(node)
      }
      if (
        node.kind === 'ObjectTypeDefinition' ||
        node.kind === 'InputObjectTypeDefinition'
      ) {
        // TODO: object and input are almost same
        return (
          code + '\n\n' + this.objectTypeToTS(node as ObjectTypeDefinitionNode)
        )
      }
      return code
    }, '')
  }

  directiveToTs(node: DirectiveDefinitionNode) {
    let directiveCode = ''
    if (node.arguments && node.arguments.length > 0) {
      directiveCode += '\n\n'
      const args = node.arguments.reduce((code, arg) => {
        const mark =
          arg.type.kind === 'NonNullType' || arg.defaultValue ? '' : '?'
        return code + `\n  ${arg.name.value}${mark}: ${this.leafToTs(arg.type)}`
      }, '')
      directiveCode += `export interface ${capitalizeStr(
        node.name.value,
      )}DirectiveArgs {${args}\n}`
    }
    return directiveCode
  }

  enumToTs(node: EnumTypeDefinitionNode) {
    if (!node.values) {
      return ''
    }
    const values = node.values
      .map((val) => `'${val.name.value}'`)
      .join('\n  | ')
    let directiveCode = `\n\nexport type ${node.name.value} = \n  | ${values}`

    return directiveCode
  }

  objectTypeToTS(type: ObjectTypeDefinitionNode) {
    if (type.fields) {
      const resolverName = type.name.value + 'Resolvers'
      this.resolversCode += `\n\nexport type ${resolverName} = {${this.fieldToResolverTS(
        type.name.value,
        type.fields,
      )}\n}`
      this.allResolverCode += `\n  ${type.name.value}: ${resolverName}`
    }

    return `export interface ${type.name.value} {${
      type.fields ? this.fieldToTS(type.name.value, type.fields) : ''
    }\n}`
  }

  fieldToTS(parentName: string, fields: ReadonlyArray<FieldDefinitionNode>) {
    return fields.reduce((code, field) => {
      const mark = field.type.kind === 'NonNullType' ? '' : '?'
      if (field.arguments && field.arguments.length > 0) {
        this.argumentCode += this.argumentsToTs(
          parentName + capitalizeStr(field.name.value) + 'Args',
          field.arguments,
        )
      }
      return (
        code +
        '\n' +
        `  ${field.name.value}${mark}: ${this.leafToTs(field.type)}`
      )
    }, '')
  }

  fieldToResolverTS(
    parentName: string,
    fields: ReadonlyArray<FieldDefinitionNode>,
  ) {
    return fields.reduce((code, field) => {
      const mark = field.type.kind === 'NonNullType' ? '' : '?'
      let args = ''
      if (field.arguments && field.arguments.length > 0) {
        args = parentName + capitalizeStr(field.name.value) + 'Args'
      }
      return (
        code +
        '\n' +
        `  ${field.name.value}${mark}: ResolverFn<${this.leafToTs(field.type)}${
          mark === '?' ? '| undefined | null' : ''
        }, ${parentName}, KnexGqlContext, ${args ? args : '{}'}>`
      )
    }, '')
  }

  leafToTs(leaf: TypeNode): string {
    if (leaf.kind === 'NamedType') {
      return scalarMap.get(leaf.name.value) || leaf.name.value
    }
    if (leaf.kind === 'ListType') {
      return this.leafToTs(leaf.type) + '[]'
    }
    if (leaf.kind === 'NonNullType') {
      return this.leafToTs(leaf.type)
    }
    throw new Error()
  }

  argumentsToTs(
    name: string,
    nodes: ReadonlyArray<InputValueDefinitionNode>,
  ): string {
    return (
      nodes.reduce((code, node) => {
        return code + `\n  ${node.name.value}: ${this.leafToTs(node.type)}`
      }, `\n\nexport interface ${name} {`) + `\n}`
    )
  }
}

const scalarMap = new Map<string, string>([
  ['String', 'string'],
  ['Int', 'number'],
  ['Float', 'number'],
  ['Boolean', 'boolean'],
  ['DateTime', 'string'],
  ['ID', 'string'],
])

function capitalizeStr(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
