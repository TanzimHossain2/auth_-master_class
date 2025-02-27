import { Policy, PolicyContext, PolicyResult } from '../Policy';
const Blocked = ['user1', 'user2'];

export class PurchasePolicy extends Policy {
  constructor() {
    super('PurchasePolicy', 'Check if user can purchase');
  }

  async can(context: PolicyContext): Promise<PolicyResult> {
    const { userId } = context;

    if (Blocked.includes(userId as string)) {
      return this.denied('User is blocked');
    }

    return this.allowed();
  }
}
