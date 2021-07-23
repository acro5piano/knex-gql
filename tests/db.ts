import { User } from './__generated__/schema'
import { knexWithLog } from './knex'

export const users = () => knexWithLog<User>('users')
