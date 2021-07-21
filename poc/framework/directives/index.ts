import { AllDirective } from './AllDirective'
import { BelongsToDirective } from './BelongsToDirective'
import { EqDirective } from './EqDirective'
import { FindDirective } from './FindDirective'
import { HasManyDirective } from './HasManyDirective'
import { InsertDirective } from './InsertDirective'
import { TableDirective } from './TableDirective'

export const directives = [
  TableDirective,

  AllDirective,
  BelongsToDirective,
  InsertDirective,
  EqDirective,
  FindDirective,
  HasManyDirective,
]
