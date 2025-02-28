# Policy-Based Authorization System

## Overview

The Policy-Based Authorization System provides a flexible framework for implementing complex access control rules. This document explains the architecture, components, and usage patterns of the policy system.

## Architecture

The system is built around the following core components:

1. **Policy** - An abstract class representing an authorization rule
2. **PolicyContext** - The data used to make authorization decisions
3. **PolicyResult** - The outcome of a policy evaluation
4. **PolicyGroup** - A collection of policies with combined logic
5. **PolicyBuilder** - A fluent API for constructing policy groups

### Component Relationships

```
┌─────────────┐     uses     ┌─────────────┐
│ PolicyGroup ├──────────────► Policy      │
└─────────────┘              └──────┬──────┘
       ▲                            │
       │                            │ returns
       │ creates                    │
┌──────┴──────┐              ┌──────▼──────┐
│PolicyBuilder│              │PolicyResult  │
└─────────────┘              └─────────────┘
                                    ▲
                                    │
┌─────────────┐     used by   ┌─────┴─────┐
│PolicyContext├──────────────►│  can()     │
└─────────────┘               └───────────┘
```

## Policy Evaluation Algorithm

The Policy system uses a chain-of-responsibility pattern to evaluate access permissions. The system supports both all-must-pass (`can`) and any-can-pass (`canAny`) evaluation strategies.

### All-Must-Pass Algorithm

The `can` method in `PolicyGroup` implements the following algorithm:

1. **Sequential Evaluation**: Process each policy in order
2. **Early Termination**: Fail fast if any policy denies access
3. **Aggregated Result**: Return the first denial or final approval

```typescript
async can(context: PolicyContext): Promise<PolicyResult> {
  for (const policy of this.policies) {
    const result = await policy.can(context);

    if (!result.allowed) {
      return result; // Early termination on denial
    }
  }

  return {
    allowed: true,
    name: this.groupName,
  };
}
```

### Any-Can-Pass Algorithm

The `canAny` method implements this alternative algorithm:

1. **Sequential Evaluation**: Process each policy in order
2. **Early Termination**: Succeed fast if any policy allows access
3. **Aggregated Result**: Return the first approval or final denial

```typescript
async canAny(context: PolicyContext): Promise<PolicyResult> {
  for (const policy of this.policies) {
    const result = await policy.can(context);

    if (result.allowed) {
      return result; // Early termination on approval
    }
  }

  return {
    allowed: false,
    name: this.groupName,
    reason: 'All policies denied',
  };
}
```

## Performance Analysis

- **Time Complexity**: O(n) where n is the number of policies in a group
- **Space Complexity**: O(1) as only one policy result is stored at a time
- **Optimization**: Early termination prevents unnecessary evaluations

## Policy Context

The `PolicyContext` interface provides a flexible structure for passing data to policies:

```typescript
export interface PolicyContext extends Record<string, unknown> {
  userId?: string | number;
  authUserId?: string | number;
  roles?: string[];
  permissions?: string[];
  featureFlags?: string[];
  email?: string;
}
```

This extensible design allows for domain-specific context data through the `Record<string, unknown>` base type.

## Creating Custom Policies

The `Policy` abstract class provides a template for creating custom authorization rules:

1. **Extend the Base Class**: Create a class that inherits from `Policy`
2. **Implement `can` Method**: Define your authorization logic
3. **Use Helper Methods**: Utilize `allowed()` and `denied()` for consistent responses

### Example: Free Trial Policy

```typescript
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
```

## Composing Policy Groups

The `PolicyBuilder` class provides a fluent API for creating policy compositions:

```typescript
// Create a group requiring all policies to pass
const subscriptionAccess = PolicyBuilder.create('subscription-access')
  .addPolicy(new ActiveSubscriptionPolicy())
  .addPolicy(new NotSuspendedPolicy())
  .build();

// Check if a user can access subscriptions
const result = await subscriptionAccess.can({
  userId: 'user123',
  subscriptionStatus: 'active',
});
```

### Policy Group Evaluation Strategies

The system supports two evaluation strategies:

1. **All Policies Must Pass** (`can` method)

   - AND logic between policies
   - Used for stricter access control

2. **Any Policy Can Pass** (`canAny` method)
   - OR logic between policies
   - Used for more flexible access control

```typescript
// Create a group where any policy can grant access
const contentAccess = PolicyBuilder.create('content-access')
  .addPolicy(new PremiumUserPolicy())
  .addPolicy(new ContentCreatorPolicy())
  .addPolicy(new ModeratorPolicy())
  .build();

// Check if a user can access content through any means
const result = await contentAccess.canAny({
  userId: 'user123',
  roles: ['content_creator'],
});
```

## Integration with Role-Based Permissions

The Policy system works seamlessly with the Role-Based Permission system:

```typescript
class RoleBasedPolicy extends Policy {
  constructor(private requiredPermission: string) {
    super(`${requiredPermission}Policy`, `Requires ${requiredPermission}`);
  }

  can(context: PolicyContext): PolicyResult {
    const pm = new PermissionManager({
      roles: context.roles || [],
      permissions: context.permissions || [],
    });

    if (pm.hasPermission(this.requiredPermission)) {
      return this.allowed();
    }

    return this.denied(`Missing permission: ${this.requiredPermission}`);
  }
}
```

## Best Practices

1. **Atomic Policies**: Design policies that handle a single concern
2. **Descriptive Names**: Use clear names and descriptions for debugging
3. **Async Support**: Leverage async/await for policies requiring external data
4. **Detailed Denials**: Provide specific reasons when access is denied
5. **Context Validation**: Validate required context before evaluation

