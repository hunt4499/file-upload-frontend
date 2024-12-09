import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import DashboardLayout from '../components/dashboard/DashboardLayout';
import axios from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/files/list', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        showAlert('error', 'Error', 'Failed to fetch files');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
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
      <DashboardLayout
        files={files}
        setFiles={setFiles}
        showAlert={showAlert}
        onLogout={handleLogout}
        isLoading={isLoading}
      />
    </>
  );
};

export { DashboardPage };