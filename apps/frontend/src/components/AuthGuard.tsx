import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { usePermissionManager } from '../hooks/usePermissonManager';

export type AuthGuardProps = {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[] | string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  loadingFallback?: React.ReactNode;
};

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requiredPermissions,
  requiredRole,
  loadingFallback = <DefaultLoadingFallback />,
  showLoading = false,
}) => {
  const auth = useKindeAuth();
  const pm = usePermissionManager(auth);

  const checkRole = () => {
    if (!requiredRole) return true;
    return pm?.hasRole(requiredRole) ?? false;
  };

  const checkPermissions = () => {
    if (!requiredPermissions) return true;

    return (
      pm?.hasPermissions(
        Array.isArray(requiredPermissions)
          ? requiredPermissions
          : [requiredPermissions]
      ) ?? false
    );
  };

  if (auth.isLoading && showLoading) {
    return loadingFallback;
  }

  if (!auth.isAuthenticated || !pm) {
    return fallback ?? null;
  }

  const hasAccess = checkRole() && checkPermissions();

  if (!hasAccess) {
    return fallback ?? null;
  }

  return <div>{children}</div>;
};

export default AuthGuard;

const DefaultLoadingFallback = () => {
  return <div>Loading...</div>;
};

export const HasRole = (
  props: Omit<AuthGuardProps, 'requiredPermissions'> & { requiredRole: string }
) => {
  return <AuthGuard {...props} />;
};

export const HasPermission = (
  props: Omit<AuthGuardProps, 'requiredRole'> & {
    requiredPermissions: string | string[];
  }
) => {
  return <AuthGuard {...props} />;
};

export const HasRoleAndPermission = (
  props: AuthGuardProps & {
    requiredRole: string;
    requiredPermissions: string | string[];
  }
) => {
  return <AuthGuard {...props} />;
};
