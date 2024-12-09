import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const AlertBox = ({ alert }) => {
  if (!alert) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <Alert variant={alert.type === 'success' ? 'default' : 'destructive'}>
        {alert.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription>{alert.message}</AlertDescription>
      </Alert>
    </div>
  );
};
