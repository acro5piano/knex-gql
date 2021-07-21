import { AllDirective } from './AllDirective'
import { BelongsToDirective } from './BelongsToDirective'
import { EqDirective } from './EqDirective'
import { FindDirective } from './FindDirective'
import { FirstDirective } from './FirstDirective'
import { HasManyDirective } from './HasManyDirective'
import { InsertDirective } from './InsertDirective'
import { PaginateDirective } from './PaginateDirective'
import { TableDirective } from './TableDirective'
import { UseResolverDirective } from './UseResolverDirective'
import { WhereDirective } from './WhereDirective'

export const directives = [
  TableDirective,

  AllDirective,
  BelongsToDirective,
  InsertDirective,
  EqDirective,
  FindDirective,
  FirstDirective,
  HasManyDirective,
  WhereDirective,
  PaginateDirective,
  UseResolverDirective,
]
