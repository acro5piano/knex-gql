import test from 'ava'

import { init, knex } from './knex'
import { log } from './util'

test.before(init)
test.before(() => {
  Object.assign(global, { log }) // shorthand
})
test.after(() => knex.destroy())
