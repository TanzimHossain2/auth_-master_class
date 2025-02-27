/**
  ==================================================================================================
 * Role enumeration representing different user roles in the application.
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  PREMIUM_USER = 'premium_user',
  USER = 'user',
  GUEST = 'guest',
}

export enum Permission {
  // Product permissions
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',
  PRODUCT_REVIEW = 'product:review',

  // User permissions
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
}

export const EnumRoleHierarchy: Record<Role, Role[]> = {
  [Role.SUPER_ADMIN]: [Role.ADMIN],
  [Role.ADMIN]: [Role.MANAGER],
  [Role.MANAGER]: [Role.PREMIUM_USER],

  [Role.PREMIUM_USER]: [Role.USER],
  [Role.USER]: [Role.GUEST],
  [Role.GUEST]: [],
};

export const EnumRoleBasedPermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [],
  [Role.ADMIN]: [Permission.PRODUCT_DELETE, Permission.USER_DELETE],
  [Role.MANAGER]: [
    Permission.PRODUCT_CREATE,
    Permission.PRODUCT_UPDATE,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
  ],

  [Role.PREMIUM_USER]: [Permission.PRODUCT_REVIEW],
  [Role.USER]: [Permission.USER_READ],
  [Role.GUEST]: [Permission.PRODUCT_READ],
};
