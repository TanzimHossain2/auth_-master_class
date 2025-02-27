# Policy-Based Access Control (PBAC) - Policy Computation

## Overview

Policy-Based Access Control (PBAC) is an advanced access control mechanism where permissions are dynamically assigned based on policies rather than static roles. This document details the policy computation model, ensuring fine-grained and flexible authorization.

## Policy Hierarchy Graph

To visualize policy relationships, consider the following hierarchy:

```
admin
├── Direct: ['product:delete', 'user:delete']
└── Inherits from:
    └── manager
        ├── Direct: ['product:create', 'product:update', 'user:create', 'user:update', 'user:read']
        └── Inherits from:
            └── premium_user
                ├── Direct: ['product:review']
                └── Inherits from:
                    └── user
                        └── Direct: ['product:read']
```

## `computePolicyHierarchy` Function

This function processes policy relationships and computes an inheritance structure, allowing efficient policy resolution.

### Algorithm

1. **Build Adjacency List**: Construct a graph representation of policy relationships.
2. **Topological Sorting**: Ensure correct processing order using Kahn’s Algorithm.
3. **Compute Inherited Policies**: Accumulate inherited policies for each role.

### Implementation

```typescript
interface PolicyHierarchy {
  [policy: string]: string[];
}

interface PolicyPermissions {
  [policy: string]: string[];
}

function computePolicyHierarchy(
  hierarchy: PolicyHierarchy,
  permissions: PolicyPermissions
): Record<string, Set<string>> {
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  const result: Record<string, Set<string>> = {};

  for (const [parent, children] of Object.entries(hierarchy)) {
    if (!graph[parent]) graph[parent] = [];
    if (!result[parent]) result[parent] = new Set(permissions[parent] || []);

    for (const child of children) {
      graph[parent].push(child);
      inDegree[child] = (inDegree[child] || 0) + 1;
      if (!result[child]) result[child] = new Set(permissions[child] || []);
    }
  }

  const queue: string[] = Object.keys(graph).filter(
    (policy) => !inDegree[policy]
  );

  while (queue.length) {
    const policy = queue.shift()!;
    for (const child of graph[policy] || []) {
      result[child] = new Set([...result[child], ...result[policy]]);
      if (--inDegree[child] === 0) queue.push(child);
    }
  }

  return result;
}
```

## Example Usage

```typescript
const policies: PolicyHierarchy = {
  admin: ['manager'],
  manager: ['premium_user'],
  premium_user: ['user'],
};

const permissions: PolicyPermissions = {
  admin: ['product:delete', 'user:delete'],
  manager: [
    'product:create',
    'product:update',
    'user:create',
    'user:update',
    'user:read',
  ],
  premium_user: ['product:review'],
  user: ['product:read'],
};

console.log(computePolicyHierarchy(policies, permissions));
```

### Expected Output

```json
{
  "admin": ["product:delete", "user:delete"],
  "manager": [
    "product:create",
    "product:update",
    "user:create",
    "user:update",
    "user:read",
    "product:delete",
    "user:delete"
  ],
  "premium_user": [
    "product:review",
    "product:create",
    "product:update",
    "user:create",
    "user:update",
    "user:read",
    "product:delete",
    "user:delete"
  ],
  "user": [
    "product:read",
    "product:review",
    "product:create",
    "product:update",
    "user:create",
    "user:update",
    "user:read",
    "product:delete",
    "user:delete"
  ]
}
```

## Key Takeaways

- **Fine-Grained Control**: Policies enable precise access control.
- **Efficiency**: Uses topological sorting for correctness.
- **Scalability**: Supports deep policy hierarchies.
- **Extensibility**: Easily adapts to dynamic policy modifications.

