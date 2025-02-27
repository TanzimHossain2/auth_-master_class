import { Policy, PolicyContext, PolicyResult } from '../Policy';

const BlockedEmail = ['user1@example.com', 'user2@example.com'];
const alreadyUsed = ['user3@example.com', 'user4@example.com'];
export class RegistrationPolicy extends Policy {
  constructor() {
    super('RegistrationPolicy', 'Check if user can register');
  }

  async can(context: PolicyContext): Promise<PolicyResult> {
    const { email } = context;

    if (BlockedEmail.includes(email as string)) {
      return this.denied('User is blocked');
    }

    if (alreadyUsed.includes(email as string)) {
      return this.denied('User already used the free trial');
    }

    return this.allowed();
  }
}

