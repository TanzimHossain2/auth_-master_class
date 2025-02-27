import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { CSSProperties } from 'react';

const CallAPI = () => {
  const { getToken } = useKindeAuth();

  const handleCallAPI = async () => {
    if (!getToken) {
      return;
    }

    const token = await getToken();

    const res = await fetch('http://localhost:4500/api', {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      console.error('Failed to fetch the API:', res.statusText);
      return;
    }

    const data = await res.json();

    console.log('API Response:', data);
  };

  return (
    <div style={style.divStyle}>
      <button onClick={handleCallAPI} style={style.button}>
        Call API
      </button>
    </div>
  );
};

export default CallAPI;

const style: { button: CSSProperties; divStyle: CSSProperties } = {
  button: {
    padding: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  divStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
};

