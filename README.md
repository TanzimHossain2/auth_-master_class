# Authorization Master Class - Roles, Permissions & Multi-Tier Subscriptions

This repository contains a comprehensive implementation of role-based and policy-based access control for a multi-tier subscription-based application. It covers hierarchical roles, permission inheritance, policy-based access control, and fine-grained authorization strategies.

## Features

- **Role-Based Access Control (RBAC):** Implements a hierarchical role system where roles inherit permissions from parent roles.
- **Permission Management:** Centralized management of permissions assigned to roles.
- **Policy-Based Access Control (PBAC):** Implements policies for fine-grained access control decisions.
- **Role Hierarchy:** Roles are structured in a hierarchical manner to allow inherited permissions.
- **Policy Groups:** Policies can be grouped to enforce complex authorization rules.
- **Flexible Policy Builder:** Easily define new policies and extend authorization logic.

## Folder Structure

```
root/
├── src/
│   ├── pm/
│   │   ├── PermissionManager.ts  # Manages roles, permissions, and hierarchy
│   │   ├── config.ts  # Defines role hierarchy and role-based permissions
│   ├── policies/
│   │   ├── Policy.ts  # Abstract base class for defining policies
│   │   ├── PolicyGroup.ts  # Groups multiple policies for collective evaluation
│   │   ├── PolicyBuilder.ts  # Builder pattern for constructing policies
│   │   ├── FreeTrialPolicy.ts  # Example policy enforcing free trial access
│   ├── index.ts  # Entry point for the application
├── README.md  # Documentation
```

## Role Hierarchy

Roles are structured hierarchically, where higher roles inherit permissions from lower roles. Below is an example hierarchy:

```
super_admin → admin → manager → (proof_reader, editor, sales_manager) → user → guest
```

## Role-Based Permissions

Each role has a set of assigned permissions. Inherited roles automatically receive permissions from their parent roles.

| Role         | Permissions |
|-------------|--------------------------------------|
| super_admin | All permissions |
| admin       | `product:delete`, `user:delete` |
| manager     | `product:update`, `user:update`, `user:create` |
| sales_manager | `product:create` |
| proof_reader | `product:review`, `product:approve`, `product:update` |
| editor      | `product:create`, `user:create` |
| premium_user | `product:review`, `user:edit` |
| user        | `user:read` |
| guest       | `product:read` |

## Policy-Based Access Control (PBAC)

Policies allow more fine-grained control beyond static role-based permissions. Policies evaluate context attributes to decide access dynamically.

### Example: Free Trial Policy
The `FreeTrialPolicy` ensures that users who are blocked or have already used the free trial cannot access it.

```typescript
export class FreeTrailPolicy extends Policy {
  constructor() {
    super('FreeTrailPolicy', 'Check if user can access the free trial');
  }

  async can(context: PolicyContext): Promise<PolicyResult> {
    const { userId } = context;

    if (Blocked.includes(userId as string)) {
      return this.denied('User is blocked');
    }

    if (alreadyUsed.includes(userId as string)) {
      return this.denied('User already used the free trial');
    }

    return this.allowed();
  }
}
```

## Getting Started

### Installation

Clone the repository and install dependencies:

```sh

pnpm install

```

### Running the Application

```sh
pnpm dev
```

### Running Tests

```sh
pnpm test
```

## Contributing

Feel free to fork the repository, submit issues, and contribute improvements via pull requests.

## License

This project is licensed under the MIT License.
