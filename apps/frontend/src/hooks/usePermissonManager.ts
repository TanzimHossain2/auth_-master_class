import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { PermissionManager } from '@learn/pm';
import { useMemo } from 'react';

type Role = {
  id: string;
  key: string;
  name: string;
};

const flattenRoles = (roles: Role[]): string[] => {
  return roles.map((role) => role.key);
};

type AuthContext = ReturnType<typeof useKindeAuth>;

export const usePermissionManager = (auth: AuthContext) => {

  
  const pm = useMemo(() => {
    if (!auth.isAuthenticated) return null;

    const claimRoles = auth.getClaim('roles')?.value as Role[] | [];
    const roles = flattenRoles(claimRoles);

    const permissions = auth.getClaim('permissions')?.value as string[] | [];

    return new PermissionManager({
      roles,
      permissions,
    });
  }, [auth]);

  return pm;
};

