import { RoleBasedPermissions, RoleHierarchy } from './config';

interface PermissionContext {
  permissions: string[];
  roles: string[];
}

export class UpdatePermissionManager {
  private readonly cachedRoleHierarchy: Map<string, Set<string>> = new Map();
  private readonly cachedRolePermissions: Map<string, Set<string>> = new Map();

  constructor(private readonly context: PermissionContext) {
    Object.keys(RoleHierarchy).forEach((role) => {
      this.cachedRoleHierarchy.set(role, this.computeRoleHierarchy(role));
    });

    Object.keys(RoleBasedPermissions).forEach((role) => {
      this.cachedRolePermissions.set(role, this.computeRolePermissions(role));
    });
  }

  // Compute the full hierarchy of roles (including inherited roles)
  private computeRoleHierarchy(role: string, visited: Set<string> = new Set()): Set<string> {
    const result = new Set<string>();

    if (visited.has(role) || !RoleHierarchy[role]) {
      return result;
    }

    visited.add(role);

    const inheritedRoles = RoleHierarchy[role] || [];

    inheritedRoles.forEach((inheritedRole) => {
      result.add(inheritedRole);

      const inheritedHierarchy = this.computeRoleHierarchy(inheritedRole, visited);
      inheritedHierarchy.forEach((r) => result.add(r));
    });

    result.add(role); // Ensure the role itself is included

    return result;
  }

  // Compute the full set of permissions for a role (including inherited ones)
  private computeRolePermissions(role: string): Set<string> {
    const result = new Set<string>();

    if (!RoleBasedPermissions[role]) {
      return result;
    }

    RoleBasedPermissions[role].forEach((permission) => result.add(permission));

    const hierarchySet = this.cachedRoleHierarchy.get(role);
    if (hierarchySet) {
      hierarchySet.forEach((inheritedRole) => {
        if (RoleBasedPermissions[inheritedRole]) {
          RoleBasedPermissions[inheritedRole].forEach((permission) => result.add(permission));
        }
      });
    }

    return result;
  }

  // Check if the user has a specific permission
  public hasPermission(requiredPermission: string): boolean {
    if (this.context.permissions.includes(requiredPermission)) {
      return true;
    }

    return this.context.roles.some((role) => this.cachedRolePermissions.get(role)?.has(requiredPermission));
  }

  // Check if the user has ALL required permissions
  public hasPermissions(requiredPermissions: string[]): boolean {
    return requiredPermissions.every((permission) => this.hasPermission(permission));
  }

  // Check if the user has AT LEAST ONE of the required permissions
  public hasAnyPermission(requiredPermissions: string[]): boolean {
    return requiredPermissions.some((permission) => this.hasPermission(permission));
  }

  // Check if the user has a specific role (including inherited ones)
  public hasRole(requiredRole: string): boolean {
    return this.context.roles.some((role) => {
      const hierarchySet = this.cachedRoleHierarchy.get(role);
      return hierarchySet?.has(requiredRole) || role === requiredRole;
    });
  }

  // Get the highest-ranking role the user has
  public getMaxRole(): string | null {
    if (!this.context.roles.length) {
      return null;
    }

    let maxRole: string | null = null;

    for (const role of this.context.roles) {
      if (!RoleHierarchy[role]) continue;

      if (!maxRole || this.cachedRoleHierarchy.get(role)?.has(maxRole)) {
        maxRole = role;
      }
    }

    return maxRole || null;
  }
}
