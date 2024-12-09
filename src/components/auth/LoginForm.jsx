import { useState } from "react";

const LoginForm = ({ onLogin, showAlert }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.email && credentials.password) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
  
        if (response.status === 401) {
          throw new Error('Invalid username or password');
        }
  
        if (!response.ok) {
          throw new Error('Login failed');
        }
  
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        onLogin();
      } catch (error) {
        showAlert('error', 'Error', error.message || 'An error occurred during login');
      }
    } else {
      showAlert('error', 'Error', 'Please fill in all fields');
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-bold">Sign in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border p-2"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border p-2"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

  export default LoginForm;