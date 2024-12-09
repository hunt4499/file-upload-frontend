import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import LoginForm from '../components/auth/LoginForm';
import axios from "../lib/axios"
import { useState } from 'react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [alert, setAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [credentials, setCredentials] = useState({
      email: '',
      password: ''
    });
  
    const showAlert = (type, title, message) => {
      setAlert({ type, title, message });
      setTimeout(() => setAlert(null), 5000);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
  
      try {
        const response = await axios.post('/api/auth/login', credentials);
        localStorage.setItem('authToken', response.data.token);
        showAlert('success', 'Success', 'Successfully logged in!');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (error) {
        showAlert(
          'error',
          'Login Failed',
          error.response?.data?.message || 'Invalid credentials'
        );
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <>
        {alert && (
          <div className="fixed top-4 right-4 z-50">
            <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
              {alert.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          </div>
        )}
  
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Sign in to your account</h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-800">
                  Sign up
                </Link>
              </p>
            </div>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border p-2"
                  required
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border p-2"
                  required
                />
              </div>
  
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  };
  
  export { LoginPage };