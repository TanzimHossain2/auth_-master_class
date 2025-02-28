# Authorization Master Class

<div align="center">
  <!-- You can add a logo here -->
  <!-- <img src="path/to/logo.png" alt="Authorization Master Class Logo" width="300"/> -->
  
  <h3 align="center">Comprehensive Authorization Implementation for Modern Applications</h3>

  <p align="center">
    A robust solution for role-based and policy-based access control in multi-tier subscription applications
    <br />
    <a href="./docs/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    ·
    <a href="#issues">Report Bug</a>
    ·
    <a href="#feature-requests">Request Feature</a>
  </p>
</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Role Hierarchy](#role-hierarchy)
- [Role-Based Permissions](#role-based-permissions)
- [Policy-Based Access Control](#policy-based-access-control)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

This repository provides a comprehensive implementation of role-based and policy-based access control for multi-tier subscription-based applications. The system supports hierarchical roles, permission inheritance, and fine-grained authorization strategies that can adapt to complex business requirements.

## Features

- **Role-Based Access Control (RBAC):**

  - Hierarchical role system with permission inheritance
  - Flexible role assignment and revocation
  - Role-based access decisions at multiple levels

- **Permission Management:**

  - Centralized permission registry
  - Dynamic permission assignment
  - Comprehensive permission validation

- **Policy-Based Access Control (PBAC):**

  - Context-aware access decisions
  - Dynamic policy evaluation
  - Extensible policy framework

- **Multi-Tier Subscription Support:**

  - Subscription-aware authorization
  - Feature-based access control
  - Time-bound access restrictions

- **Advanced Features:**
  - Role hierarchy with multi-parent inheritance
  - Policy groups for complex authorization scenarios
  - Efficient caching mechanisms for performance optimization

## System Architecture

```
root/
├── packages/
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

## Installation

### Prerequisites

- Node.js (v14 or later)
- pnpm or npm

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/authorization-master-class.git
cd authorization-master-class
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Build the project:

```bash
pnpm build
# or
npm run build
```

## Usage

### Basic Implementation

```typescript
import { PermissionManager } from './src/pm/PermissionManager';
import { FreeTrialPolicy } from './src/policies/FreeTrialPolicy';

// Initialize permission manager
const pm = new PermissionManager();

// Check if user has permission
const hasPermission = pm.can('user123', 'product:read');

// Apply policy-based check
const policy = new FreeTrialPolicy();
const canAccessFreeTrial = await policy.can({
  userId: 'user123',
  action: 'access',
  resource: 'freeTrial',
});
```

### Advanced Configuration

See the [examples](#examples) section for more complex implementations.

## Role Hierarchy

Roles are structured hierarchically, where higher roles inherit permissions from lower roles:

```
super_admin → admin → manager → (proof_reader, editor, sales_manager) → user → guest
```

<details>
  <summary>View Graphical Hierarchy</summary>
  
  ```
  super_admin
  │
  ├─ admin
  │  │
  │  └─ manager
  │     │
  │     ├─ proof_reader
  │     ├─ editor
  │     └─ sales_manager
  │        │
  │        └─ user
  │           │
  │           └─ guest
  ```
</details>

## Role-Based Permissions

Each role has a set of assigned permissions. Inherited roles automatically receive permissions from their parent roles.

| Role          | Permissions                                           |
| ------------- | ----------------------------------------------------- |
| super_admin   | All permissions                                       |
| admin         | `product:delete`, `user:delete`                       |
| manager       | `product:update`, `user:update`, `user:create`        |
| sales_manager | `product:create`                                      |
| proof_reader  | `product:review`, `product:approve`, `product:update` |
| editor        | `product:create`, `user:create`                       |
| premium_user  | `product:review`, `user:edit`                         |
| user          | `user:read`                                           |
| guest         | `product:read`                                        |

## Policy-Based Access Control (PBAC)

Policies allow more fine-grained control beyond static role-based permissions. Policies evaluate context attributes to decide access dynamically.

### Example: Free Trial Policy

```typescript
export class FreeTrialPolicy extends Policy {
  constructor() {
    super('FreeTrialPolicy', 'Check if user can access the free trial');
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

## Examples

<details>
  <summary><strong>Example 1: Basic Role-Based Access</strong></summary>
  
  ```typescript
  import { PermissionManager } from './src/pm/PermissionManager';
  
  const pm = new PermissionManager();
  
  // Check if user with 'editor' role can create products
  const canCreate = pm.can('editor', 'product:create'); // true
  ```
</details>

<details>
  <summary><strong>Example 2: Complex Policy Group</strong></summary>
  
  ```typescript
  import { PolicyGroup } from './src/policies/PolicyGroup';
  import { FreeTrialPolicy } from './src/policies/FreeTrialPolicy';
  import { SubscriptionPolicy } from './src/policies/SubscriptionPolicy';
  
  // Create a policy group that requires ALL policies to pass
  const policyGroup = new PolicyGroup('TrialAccess', [
    new FreeTrialPolicy(),
    new SubscriptionPolicy()
  ], { combinator: 'all' });
  
  const result = await policyGroup.can({
    userId: 'user123',
    action: 'access',
    resource: 'premiumFeature'
  });
  ```
</details>