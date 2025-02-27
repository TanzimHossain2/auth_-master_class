import AuthGuard, {
  HasPermission,
  HasRole,
  HasRoleAndPermission,
} from './components/AuthGuard';
import CallAPI from './components/CallAPI';
import { Login } from './components/Login';
import Profile from './components/Profile';

const App = () => {
  return (
    <>
      <AuthGuard fallback={<Login />}>
        <Profile />
        <CallAPI />
        <HasRole requiredRole="admin">
          <button>Go to Admin Panel</button>
        </HasRole>
        <ManageProducts />
        <SecretComponent />
      </AuthGuard>
    </>
  );
};

export default App;

const ManageProducts = () => {
  return (
    <div>
      <div>
        <h1>Manage Products</h1>
        <HasPermission requiredPermissions="product:create">
          <button>Add Product</button>
        </HasPermission>
      </div>
      <div>
        <h3>Product List</h3>
        <HasPermission requiredPermissions="product:read">
          <ProductItem />
          <ProductItem />
          <ProductItem />
        </HasPermission>
      </div>
    </div>
  );
};

const ProductItem = () => {
  return (
    <div>
      <h4>Product Name</h4>
      <p>Product Description</p>
      <div>
        <HasPermission requiredPermissions="product:update">
          <button>Update</button>
        </HasPermission>
        <HasPermission requiredPermissions="product:delete">
          <button>Delete</button>
        </HasPermission>
      </div>
    </div>
  );
};

const SecretComponent = () => {
  return (
    <div>
      <HasRoleAndPermission
        requiredRole="admin"
        requiredPermissions="product:update"
      >
        <h3>Admin Section</h3>
        <p>
          This is a paragraph that only admins with product:update permission
          can
        </p>

        <div>
          <button>Edit Settings</button>
        </div>
      </HasRoleAndPermission>
    </div>
  );
};
