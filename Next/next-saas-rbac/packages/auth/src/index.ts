import type {
  CreateAbility,
  MongoAbility,
} from '@casl/ability'
import type { User } from './models/User'
import type { ProjectSubject } from './subjects/project'

import type { UserSubject } from './subjects/user'
import {
  AbilityBuilder,
  createMongoAbility,
} from '@casl/ability'
import { permissions } from './permissions'

type AppAbilities = UserSubject | ProjectSubject | ['manage', 'all']

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new TypeError(`Permissions for role ${user.role} not found`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build()

  return ability

  // can('invite', 'User')
  // cannot('delete', 'User')

  // export const ability = build()
}
