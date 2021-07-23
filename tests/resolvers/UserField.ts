import { UserResolvers } from '../__generated__/schema'
import { sha256 } from '../util'

export const UserField: Partial<UserResolvers> = {
  hashedName: (user) => {
    return sha256(user.name)
  },
}
