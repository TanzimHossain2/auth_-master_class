# Role-Based Permission System

## Overview

The Role-Based Permission System provides a flexible and efficient way to manage user permissions through role hierarchies. This document explains the architecture, algorithms, and usage patterns of the permission management system.

## Architecture

The system consists of two main components:

1. **Role Hierarchy** - Defines inheritance relationships between roles
2. **Role-Based Permissions** - Maps specific permissions to each role

### Key Concepts

- **Role Inheritance**: Roles can inherit permissions from other roles
- **Permission Propagation**: Permissions flow down the role hierarchy
- **Caching**: Role hierarchies and permissions are pre-computed and cached for performance

## Role Hierarchy Visualization

```
super_admin
├── Direct: []
└── Inherits from:
    └── admin
        ├── Direct: ['product:delete', 'user:delete']
        └── Inherits from:
            └── manager
                ├── Direct: ['product:update', 'user:update', 'user:create']
                └── Inherits from:
                    ├── proof_reader
                    │   ├── Direct: ['product:review', 'product:approve', 'product:update']
                    │   └── Inherits from:
                    │       └── user
                    │           └── Direct: ['user:read']
                    ├── editor
                    │   ├── Direct: ['product:create', 'user:create']
                    │   └── Inherits from:
                    │       ├── user
                    │       │   └── Direct: ['user:read']
                    │       └── premium_user
                    │           ├── Direct: ['product:review', 'user:edit']
                    │           └── Inherits from:
                    │               └── user
                    │                   └── Direct: ['user:read']
                    └── sales_manager
                        ├── Direct: ['product:create']
                        └── Inherits from:
                            └── user
                                └── Direct: ['user:read']
```

## Algorithm: Role Hierarchy Computation

The `computeRoleHierarchy` algorithm flattens a hierarchical role structure into a set of all inherited roles for efficient permission checking.

### Algorithm Steps

1. **Depth-First Traversal**: Recursively explore the role hierarchy
2. **Cycle Detection**: Use a visited set to prevent infinite recursion
3. **Set Accumulation**: Build sets of inherited roles for each role

### Implementation

```typescript
private computeRoleHierarchy(role: string, visited: Set<string> = new Set()) {
  const result = new Set<string>();

  // Prevent cycles in the hierarchy
  if (visited.has(role)) {
    return result;
  }

  visited.add(role);

  // Get all roles this role inherits from
  const inheritedRoles = RoleHierarchy[role] || [];

  // Add all inherited roles and their own inherited roles
  inheritedRoles.forEach((inheritedRole) => {
    result.add(inheritedRole);

    const inheritedHierarchy = this.computeRoleHierarchy(
      inheritedRole,
      visited
    );

    inheritedHierarchy.forEach((role) => result.add(role));
  });

  // Include the current role in its own hierarchy
  result.add(role);

  return result;
}
```

## Algorithm: Permission Computation

The `computeRolePermissions` algorithm determines all permissions available to a role, including those inherited from other roles.

### Algorithm Steps

1. **Direct Permission Collection**: Gather explicit permissions for the role
2. **Hierarchy Traversal**: Collect permissions from all inherited roles
3. **Permission Aggregation**: Combine permissions into a unified set

### Implementation

```typescript
private computeRolePermissions(role: string, visited: Set<string> = new Set()) {
  const result = new Set<string>();

  if (visited.has(role)) {
    return result;
  }

  // Add direct permissions
  RoleBasedPermissions[role].forEach((permission) => {
    result.add(permission);
  });

  // Add permissions from inherited roles
  const hierarchySet = this.cachedRoleHierarchy.get(role);

  hierarchySet &&
    hierarchySet.forEach((inheritedRole) => {
      RoleBasedPermissions[inheritedRole].forEach((permission) => {
        result.add(permission);
      });
    });

  return result;
}
```

## Performance Considerations

- **Time Complexity**: O(N + E) where N is the number of roles and E is the number of inheritance relationships
- **Space Complexity**: O(N²) in the worst case for storing the flattened hierarchy
- **Optimization**: Pre-computed hierarchies and permission sets are cached on initialization

## Usage Examples

### Permission Checking

```typescript
// Check if a user has a specific permission
const pm = new PermissionManager({ roles: ['editor'], permissions: [] });
const canCreateProduct = pm.hasPermission('product:create'); // true

// Check if a user has all required permissions
const canManageUsers = pm.hasPermissions(['user:create', 'user:update']); // false

// Check if a user has any of the specified permissions
const canAccessProducts = pm.hasAnyPermission([
  'product:create',
  'product:update',
]); // true
```

### Role Determination

```typescript
// Check if a user has a specific role or inherits it
const isAdmin = pm.hasRole('admin'); // false

// Get the highest role in the hierarchy
const highestRole = pm.getMaxRole(); // 'editor'
```

