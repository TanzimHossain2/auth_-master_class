# Authorization System Algorithms

## Overview

This document provides a detailed explanation of the algorithms used in our authorization systems. Understanding these algorithms is essential for maintaining, extending, and optimizing the permission management and policy evaluation logic.

## Role Hierarchy Algorithm

### Purpose

The role hierarchy algorithm computes the transitive closure of the role inheritance graph, allowing for efficient permission checks.

### Visualization

```
          super_admin
              │
              ▼
            admin
              │
              ▼
           manager
         /    │    \
        ▼     ▼     ▼
proof_reader editor sales_manager
    │       /  \        │
    │      ▼    ▼       │
    └─► user  premium_user
         ▲        │
         └────────┘
```

### Algorithm: Depth-First Traversal with Cycle Detection

```typescript
/**
 * Computes the complete set of roles inherited by a given role
 * using depth-first traversal with cycle detection
 *
 * @param role - The role to compute hierarchy for
 * @param visited - Set to track visited roles for cycle detection
 * @returns A set containing all roles inherited by the given role
 */
function computeRoleHierarchy(
  role: string,
  visited: Set<string> = new Set()
): Set<string> {
  const result = new Set<string>();

  // Base case: prevent cycles
  if (visited.has(role)) {
    return result;
  }

  // Mark current role as visited
  visited.add(role);

  // Get direct inherited roles
  const inheritedRoles = RoleHierarchy[role] || [];

  // For each directly inherited role
  inheritedRoles.forEach((inheritedRole) => {
    // Add the inherited role
    result.add(inheritedRole);

    // Recursively process inherited roles (DFS)
    const transitiveRoles = computeRoleHierarchy(inheritedRole, visited);

    // Add all transitively inherited roles
    transitiveRoles.forEach((transRole) => result.add(transRole));
  });

  // Include the current role itself
  result.add(role);

  return result;
}
```

### Time and Space Complexity

- **Time Complexity**: O(V + E) where V is the number of roles and E is the number of inheritance relationships
- **Space Complexity**: O(V) for the visited set and result set
- **Output Size**: Up to O(V²) for the cached flattened hierarchy across all roles

## Permission Computation Algorithm

### Purpose

The permission computation algorithm determines all permissions available to a role, considering direct permissions and those inherited through the role hierarchy.

### Algorithm: Set-Based Permission Aggregation

```typescript
/**
 * Computes all permissions available to a role, including those
 * inherited from other roles in the hierarchy
 *
 * @param role - The role to compute permissions for
 * @returns A set containing all permissions available to the role
 */
function computeRolePermissions(role: string): Set<string> {
  const result = new Set<string>();

  // Add direct permissions assigned to this role
  RoleBasedPermissions[role].forEach((permission) => {
    result.add(permission);
  });

  // Get the precomputed role hierarchy
  const hierarchySet = cachedRoleHierarchy.get(role);

  // Add permissions from all inherited roles
  hierarchySet &&
    hierarchySet.forEach((inheritedRole) => {
      RoleBasedPermissions[inheritedRole].forEach((permission) => {
        result.add(permission);
      });
    });

  return result;
}
```

### Time and Space Complexity

- **Time Complexity**: O(R × P) where R is the number of inherited roles and P is the average number of permissions per role
- **Space Complexity**: O(P) where P is the total number of unique permissions
- **Optimization**: Pre-computing and caching reduces runtime checks to O(1)

## Policy Evaluation Algorithms

### Purpose

Policy evaluation algorithms determine whether a user's context satisfies the requirements specified by one or more policies.

### Algorithm: Sequential AND Evaluation (All Must Pass)

```typescript
/**
 * Evaluates if all policies allow access for a given context
 * using a logical AND operation (all must pass)
 *
 * @param policies - Array of policies to evaluate
 * @param context - Context containing user information
 * @returns Result indicating if access is allowed or denied
 */
async function evaluateAllPolicies(
  policies: Policy[],
  context: PolicyContext
): Promise<PolicyResult> {
  for (const policy of policies) {
    const result = await policy.can(context);

    // Early termination on first denial
    if (!result.allowed) {
      return result;
    }
  }

  // All policies passed
  return {
    allowed: true,
    name: 'PolicyGroup',
    reason: 'All policies allowed access',
  };
}
```

### Algorithm: Sequential OR Evaluation (Any Can Pass)

```typescript
/**
 * Evaluates if any policy allows access for a given context
 * using a logical OR operation (any can pass)
 *
 * @param policies - Array of policies to evaluate
 * @param context - Context containing user information
 * @returns Result indicating if access is allowed or denied
 */
async function evaluateAnyPolicy(
  policies: Policy[],
  context: PolicyContext
): Promise<PolicyResult> {
  for (const policy of policies) {
    const result = await policy.can(context);

    // Early termination on first approval
    if (result.allowed) {
      return result;
    }
  }

  // No policy allowed access
  return {
    allowed: false,
    name: 'PolicyGroup',
    reason: 'All policies denied access',
  };
}
```

### Time and Space Complexity

- **Time Complexity**: O(P) where P is the number of policies (best case: O(1) with early termination)
- **Space Complexity**: O(1) as only one result is maintained
- **Optimization**: Early termination prevents unnecessary evaluations

## Integration: Permission-Based Policy Algorithm

### Purpose

This algorithm combines role-based permissions with policy-based authorization for comprehensive access control.

### Algorithm: Two-Phase Authorization

```typescript
/**
 * Two-phase authorization combining permission checks and policy evaluation
 *
 * @param requiredPermissions - Permissions needed for access
 * @param policies - Additional policies to evaluate
 * @param context - User context with roles and other attributes
 * @returns Boolean indicating if access is granted
 */
async function authorize(
  requiredPermissions: string[],
  policies: Policy[],
  context: PolicyContext
): Promise<boolean> {
  // Phase 1: Permission check
  const pm = new PermissionManager({
    roles: context.roles || [],
    permissions: context.permissions || [],
  });

  if (!pm.hasPermissions(requiredPermissions)) {
    return false;
  }

  // Phase 2: Policy evaluation
  if (policies.length > 0) {
    const policyGroup = new PolicyGroup('authorization', policies);
    const policyResult = await policyGroup.can(context);
    return policyResult.allowed;
  }

  return true;
}
```

### Time and Space Complexity

- **Time Complexity**: O(P + R) where P is the number of policies and R is the number of required permissions
- **Space Complexity**: O(1) for evaluation results
- **Optimization**: Permission checks use pre-computed data for O(1) lookups per permission

## Conclusion

The authorization system employs efficient graph traversal and set operations to compute role hierarchies and permissions. Policy evaluation uses short-circuit evaluation for optimal performance.

By pre-computing hierarchies and permission sets at initialization, runtime permission checks achieve constant time complexity, making the system highly efficient for frequent authorization checks.

