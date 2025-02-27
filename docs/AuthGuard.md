# AuthGuard Component

`AuthGuard` is a React component that provides role-based and permission-based access control for your application. It helps you restrict access to certain parts of your UI based on the user's authentication status, roles, and permissions.

## Features

- Authentication verification
- Role-based access control
- Permission-based access control
- Combined role and permission checks
- Customizable fallback content
- Loading state handling

## Installation

AuthGuard is included in the project and relies on the Kinde authentication provider. Make sure you have the required dependencies:

```bash
npm install @kinde-oss/kinde-auth-react
```

## Basic Usage

### Protecting Routes/Components

Wrap any component that should only be visible to authenticated users:

```tsx
import AuthGuard from './components/AuthGuard';
import { Login } from './components/Login';

const ProtectedPage = () => {
  return (
    <AuthGuard fallback={<Login />}>
      <h1>Protected Content</h1>
      <p>Only authenticated users can see this.</p>
    </AuthGuard>
  );
};
```

### Role-Based Access Control

Use the `HasRole` component to show content only to users with a specific role:

```tsx
import { HasRole } from './components/AuthGuard';

const AdminFeature = () => {
  return (
    <HasRole requiredRole="admin" fallback={<p>Admin access required</p>}>
      <button>Admin Settings</button>
    </HasRole>
  );
};
```

### Permission-Based Access Control

Restrict access based on specific permissions:

```tsx
import { HasPermission } from './components/AuthGuard';

const ProductActions = () => {
  return (
    <>
      <HasPermission requiredPermissions="product:read">
        <div>Product list visible to users with read permission</div>
      </HasPermission>

      <HasPermission requiredPermissions={['product:create', 'product:update']}>
        <div>Only visible if user has BOTH create AND update permissions</div>
      </HasPermission>
    </>
  );
};
```

### Combined Role and Permission Check

For scenarios where both role and specific permissions are required:

```tsx
import { HasRoleAndPermission } from './components/AuthGuard';

const AdminSettings = () => {
  return (
    <HasRoleAndPermission
      requiredRole="admin"
      requiredPermissions="settings:write"
      fallback={<p>Insufficient privileges</p>}
    >
      <h2>Advanced Settings</h2>
      <p>Configure system parameters</p>
    </HasRoleAndPermission>
  );
};
```

## API Reference

### `AuthGuard` Component

Base component for access control.

#### Props

| Prop                  | Type               | Default                      | Description                              |
| --------------------- | ------------------ | ---------------------------- | ---------------------------------------- |
| `children`            | React.ReactNode    | (Required)                   | Content to render when access is granted |
| `requiredRole`        | string             | undefined                    | Role required to access content          |
| `requiredPermissions` | string \| string[] | undefined                    | Permission(s) required to access content |
| `fallback`            | React.ReactNode    | null                         | Content to display when access is denied |
| `showLoading`         | boolean            | false                        | Whether to show loading state            |
| `loadingFallback`     | React.ReactNode    | `<DefaultLoadingFallback />` | Content to display during loading        |

### Specialized Components

#### `HasRole`

Specialized component for role-based access control.

```tsx
<HasRole requiredRole="admin" fallback={<p>Admin access required</p>}>
  <AdminPanel />
</HasRole>
```

#### `HasPermission`

Specialized component for permission-based access control.

```tsx
<HasPermission
  requiredPermissions={['users:read', 'users:write']}
  fallback={<p>You don't have permission to manage users</p>}
>
  <UserManagement />
</HasPermission>
```

#### `HasRoleAndPermission`

Specialized component that requires both a specific role and permission(s).

```tsx
<HasRoleAndPermission
  requiredRole="admin"
  requiredPermissions="system:configure"
>
  <SystemSettings />
</HasRoleAndPermission>
```

## Best Practices

1. **Layered Authorization**: Apply authorization at different levels (pages, sections, buttons)
2. **Meaningful Fallbacks**: Provide informative fallback content to explain why access is restricted
3. **Consistent Permission Naming**: Use a consistent naming convention for permissions (e.g., `resource:action`)
4. **Minimize Loading Flashes**: Only use `showLoading` for components that may take time to authorize

## Working with the Permission Manager

The `AuthGuard` component uses the `usePermissionManager` hook internally, which provides methods to check roles and permissions:

- `hasRole(role)`: Checks if the user has a specific role
- `hasPermissions(permissions)`: Checks if the user has all the specified permissions

You can use this hook directly in your components for more complex authorization logic:

```tsx
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { usePermissionManager } from '../hooks/usePermissonManager';

const ComplexAuthComponent = () => {
  const auth = useKindeAuth();
  const pm = usePermissionManager(auth);

  const canAccessFeatureA =
    pm?.hasRole('editor') || pm?.hasPermissions(['content:write']);
  const canAccessFeatureB =
    pm?.hasRole('admin') && pm?.hasPermissions(['users:manage']);

  return (
    <div>
      {canAccessFeatureA && <FeatureA />}
      {canAccessFeatureB && <FeatureB />}
    </div>
  );
};
```
