import { RoleBasedPermissions, RoleHierarchy } from './config';

interface PermissionContext {
  permissions: string[];
  roles: string[];
}

export class PermissionManager {
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

  // Flatten the role hierarchy and cache it
  private computeRoleHierarchy(role: string, visited: Set<string> = new Set()) {
    const result = new Set<string>();

    if (visited.has(role)) {
      return result;
    }

    visited.add(role);

    const inheritedRoles = RoleHierarchy[role] || [];

    inheritedRoles.forEach((inheritedRole) => {
      result.add(inheritedRole);

      const inheritedHierarchy = this.computeRoleHierarchy(
        inheritedRole,
        visited
      );

      inheritedHierarchy.forEach((role) => result.add(role));
    });

    result.add(role);

    return result;
  }

  // Flatten the role permissions and cache it
  private computeRolePermissions(
    role: string,
    visited: Set<string> = new Set()
  ) {
    const result = new Set<string>();

    if (visited.has(role)) {
      return result;
    }

    RoleBasedPermissions[role].forEach((permission) => {
      result.add(permission);
    });

    const hierarchySet = this.cachedRoleHierarchy.get(role);

    hierarchySet &&
      hierarchySet.forEach((inheritedRole) => {
        RoleBasedPermissions[inheritedRole].forEach((permission) => {
          result.add(permission);
        });
      });

    return result;
  }

  // Permission check

  hasPermission1(requiredPermission: string) {
		if (this.context.permissions.includes(requiredPermission)) {
			return true;
		}

		return this.hasPermissionThroughRole(
			this.context.roles,
			requiredPermission
		);
	}



  public hasPermission(requiredPermission: string) {
    if (!this.context.roles || this.context.roles.length === 0) {
      return false;
    }

    for (const role of this.context.roles) {
      const permissionSet = this.cachedRolePermissions.get(role);
      if (permissionSet?.has(requiredPermission)) {
        return true;
      }
    }

    return false;
  }

  public hasPermissions(requiredPermissions: string[]) {
    return requiredPermissions.every((permission) =>
      this.hasPermission(permission)
    );
  }

  public hasAnyPermission(requiredPermissions: string[]) {
    return requiredPermissions.some((permission) =>
      this.hasPermission(permission)
    );
  }

  // Role check
  public hasRole(requiredRole: string) {
    if (!this.context.roles || this.context.roles.length === 0) {
      return false;
    }

    return this.context.roles.some((role) => {
      const hierarchySet = this.cachedRoleHierarchy.get(role);

      return hierarchySet?.has(requiredRole) || role === requiredRole;
    });
  }

  public getMaxRole() {
    if (!this.context.roles || this.context.roles.length === 0) {
      return null;
    }

    return this.context.roles.reduce((maxRole, currentRole) => {
      return this.cachedRoleHierarchy.get(maxRole)?.has(currentRole)
        ? maxRole
        : currentRole;
    }, this.context.roles[0]);
  }



  private hasPermissionThroughRole(roles: string[], permission: string) {
		return roles.some((role) =>
			this.cachedRolePermissions.get(role)?.has(permission)
		);
	}
}

