# Role-Based Access Control (RBAC) - Role Hierarchy Computation

## Overview

Role-Based Access Control (RBAC) is a method of restricting system access based on user roles. This document details the implementation of role hierarchy computation, ensuring a structured permission model where higher roles inherit permissions from lower roles.

## Role Hierarchy Graph

To visualize role relationships, consider the following hierarchy:

```
       ┌──────────┐
       │  Admin   │
       └──────────┘
            │
       ┌──────────┐
       │ Manager  │
       └──────────┘
        │      │
┌──────────┐ ┌──────────┐
│ Developer│ │  Analyst │
└──────────┘ └──────────┘
        │
┌──────────┐
│ Intern   │
└──────────┘
```

## `computeRoleHierarchy` Function

This function processes role relationships and computes an inheritance tree, allowing efficient permission resolution.

### Algorithm

1. **Build Adjacency List**: Construct a graph representation of role relationships.
2. **Topological Sorting**: Ensure correct processing order using Kahn’s Algorithm.
3. **Compute Inherited Roles**: Accumulate inherited roles for each role.

### Implementation

```typescript
interface RoleHierarchy {
  [role: string]: string[];
}

function computeRoleHierarchy(
  hierarchy: RoleHierarchy
): Record<string, Set<string>> {
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  const result: Record<string, Set<string>> = {};

  for (const [parent, children] of Object.entries(hierarchy)) {
    if (!graph[parent]) graph[parent] = [];
    if (!result[parent]) result[parent] = new Set();

    for (const child of children) {
      graph[parent].push(child);
      inDegree[child] = (inDegree[child] || 0) + 1;
      if (!result[child]) result[child] = new Set();
    }
  }

  const queue: string[] = Object.keys(graph).filter((role) => !inDegree[role]);

  while (queue.length) {
    const role = queue.shift()!;
    for (const child of graph[role] || []) {
      result[child] = new Set([...result[child], role, ...result[role]]);
      if (--inDegree[child] === 0) queue.push(child);
    }
  }

  return result;
}
```

## Example Usage

```typescript
const roles: RoleHierarchy = {
  Admin: ['Manager'],
  Manager: ['Developer', 'Analyst'],
  Developer: ['Intern'],
};

console.log(computeRoleHierarchy(roles));
```

### Expected Output

```json
{
  "Admin": [],
  "Manager": ["Admin"],
  "Developer": ["Manager", "Admin"],
  "Analyst": ["Manager", "Admin"],
  "Intern": ["Developer", "Manager", "Admin"]
}
```

## Key Takeaways

- **Efficiency**: Uses topological sorting for correctness.
- **Scalability**: Handles deep role hierarchies efficiently.
- **Extensibility**: Supports dynamic role modifications.

