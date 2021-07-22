import test from 'ava'

import { init, knex } from './knex'

test.before(init)
test.after(() => knex.destroy())
