import test from 'ava'
import MockDate from 'mockdate'

import { knexGql } from '../schema'

test('typegen', (t) => {
  MockDate.set('2021-07-22T07:53:43.585Z')

  t.snapshot(knexGql.schemaToTypeScriptSchema())
})
