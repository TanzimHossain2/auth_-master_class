export const RoleHierarchy: Record<string, string[]> = {
  super_admin: ['admin'],
  admin: ['manager'],
  manager: ['proof_reader', 'editor', 'sales_manager'],
  sales_manager: ['user'],
  proof_reader: ['user'],
  editor: ['user', 'premium_user'],
  premium_user: ['user'],
  user: ['guest'],
  guest: [],
};

export const RoleBasedPermissions: Record<string, string[]> = {
  super_admin: [],
  admin: ['product:delete', 'user:delete'],
  manager: ['product:update', 'user:update', 'user:create'],
  sales_manager: ['product:create'],
  proof_reader: ['product:review', 'product:approve', 'product:update'],
  editor: ['product:create', 'user:create'],
  premium_user: ['product:review', 'user:edit'],
  user: ['user:read'],
  guest: ['product:read'],
};

