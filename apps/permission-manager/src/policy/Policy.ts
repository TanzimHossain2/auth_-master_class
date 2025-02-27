export interface PolicyContext extends Record<string, unknown> {
  userId?: string | number;
  authUserId?: string | number;
  roles?: string[];
  permissions?: string[];
  featureFlags?: string[];
  email?: string;
}

export interface PolicyResult {
  name: string;
  allowed: boolean;
  reason?: string;
}

export abstract class Policy {
  constructor(
    public readonly name: string,
    public readonly description: string
  ) {}

  abstract can(context: PolicyContext): Promise<PolicyResult> | PolicyResult;

  protected allowed(): PolicyResult {
    return {
      allowed: true,
      name: this.name,
      reason: 'Access granted',
    };
  }

  protected denied(reason?: string): PolicyResult {
    return {
      allowed: false,
      name: this.name,
      reason: reason || 'Access denied',
    };
  }
}

export class PolicyGroup {
  constructor(
    private readonly groupName: string,
    private readonly policies: Policy[]
  ) {}

  async can(context: PolicyContext): Promise<PolicyResult> {
    for (const policy of this.policies) {
      const result = await policy.can(context);

      if (!result.allowed) {
        return result;
      }
    }

    return {
      allowed: true,
      name: this.groupName,
    };
  }

  async canAny(context: PolicyContext): Promise<PolicyResult> {
    for (const policy of this.policies) {
      const result = await policy.can(context);

      if (result.allowed) {
        return result;
      }
    }

    return {
      allowed: false,
      name: this.groupName,
      reason: 'All policies denied',
    };
  }
}



export class PolicyBuilder {
  private policies: Policy[] = [];
  private name: string = 'default';

  private constructor(name: string) {
    this.name = name;
  }

  public static create(name: string) {
    return new PolicyBuilder(name);
  }

  public addPolicy(policy: Policy) {
    this.policies.push(policy);
    return this;
  }

  public addPolicies(policies: Policy[]) {
    this.policies.push(...policies);
    return this;
  }

  public build() {
    return new PolicyGroup(this.name, this.policies);
  }
}

