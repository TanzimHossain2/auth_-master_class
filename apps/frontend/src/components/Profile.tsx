import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const Profile = () => {
  const { user, isLoading, logout,login, isAuthenticated, register } = useKindeAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Please Login</h1>
        <button onClick={() => login()}>Login</button>
        <button onClick={() => register()}>Signup</button>
      </div>
    );
  }
  

  return (
    <div>
      <div>
			<h1>Hello, {user?.given_name}</h1>
			<button onClick={logout}>Logout</button>
		</div>
    </div>
  );
};

export default Profile;

