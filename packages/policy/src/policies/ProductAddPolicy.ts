import { Policy, PolicyContext, PolicyResult } from '../Policy.js';

const BlockedId = ['kp_43fd837d2eca4ad8acbd5c8f5fe690ad'];

export class ProductAddPolicy extends Policy {
  private static instance: ProductAddPolicy;

  constructor() {
    super('ProductAddPolicy', 'Check if user can add product');
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ProductAddPolicy();
    }
    return this.instance;
  }

  async can(context: PolicyContext): Promise<PolicyResult> {
    const { userId } = context;

    if (BlockedId.includes(userId as string)) {
      return this.denied(`User with id ${userId} is blocked`);
    }

    return this.allowed();
  }
}

