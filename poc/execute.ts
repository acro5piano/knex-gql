import { knexGql } from './schema'
import { gql } from './util'

async function main() {
  await knexGql.knex.schema.createTable('users', (t) => {
    t.bigIncrements('id')
    t.string('name').notNullable()
  })
  await knexGql.knex('users').insert({
    name: 'Kazuya',
  })

  const res = await knexGql.query(gql`
    query {
      user {
        id
        name
      }
    }
  `)

  console.log(res)

  await knexGql.knex.destroy()
}

main()
