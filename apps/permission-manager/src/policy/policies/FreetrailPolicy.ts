import { Policy, PolicyContext, PolicyResult } from '../Policy';

const Blocked = ['user1', 'user2'];

const alreadyUsed = ['user3', 'user4'];

export class FreeTrailPolicy extends Policy {
  constructor() {
    super('FreeTrailPolicy', 'Check if user can access the free trail');
  }

  async can(context: PolicyContext): Promise<PolicyResult> {
    const { userId } = context;

    if (Blocked.includes(userId as string)) {
      return this.denied('User is blocked');
    }

    if (alreadyUsed.includes(userId as string)) {
      return this.denied('User already used the free trail');
    }

    return this.allowed();
  }
}

