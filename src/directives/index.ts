import { AllDirective } from './AllDirective'
import { BelongsToDirective } from './BelongsToDirective'
import { FirstDirective } from './FirstDirective'
import { HasManyDirective } from './HasManyDirective'
import { HasManyThroughDirective } from './HasManyThroughDirective'
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
  FirstDirective,
  HasManyDirective,
  WhereDirective,
  PaginateDirective,
  UseResolverDirective,
  HasManyThroughDirective,
]
