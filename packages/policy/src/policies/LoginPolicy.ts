import { Policy, PolicyContext, PolicyResult } from '../Policy.js';

const BlockedEmail = ['user1@example.com', 'user2@example.com'];

export class LoginPolicy extends Policy {
  constructor() {
    super('LoginPolicy', 'Check if user can login');
  }

  async can(context: PolicyContext): Promise<PolicyResult> {
    const { email } = context;

    if (BlockedEmail.includes(email as string)) {
      return this.denied('User is blocked');
    }

    return this.allowed();
  }
}

