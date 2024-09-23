import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authcontext';

import Card from '../components/ui/Card';
import Title from '../components/ui/Title';
import InfoBlock from './ui/InfoBlock';
import ErrorBlock from './ui/ErrorBlock';
import ButtonFilled from './ui/ButtonFilled';

interface LogoutProps {
  onSuccess: () => void; // A function to handle success, no return value
}

const Logout: React.FC<LogoutProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string | null>(null);

  // context related content
  const { baseUrl, X_REQUEST_STR } = useAuth();

  const handleLogout = async (ev: FormEvent) => {
    ev.preventDefault();
    try {
      // Clear the cookie by calling the backend logout API
      await axios.post(
        `${baseUrl}/api/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        }
      );
      // Call on success
      onSuccess();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response) {
        // If the server responded with a status code out of the 2xx range
        console.log(e.response.data); // This should print the detail message
        setError(e.response.data.detail || 'An error occurred'); // Use the detail message if available
      } else if (axios.isAxiosError(e) && e.request) {
        // If the request was made but no response was received
        console.log(e.request);
        setError('No response received');
      } else if (e instanceof Error) {
        // Something happened while setting up the request
        console.log('Error', e.message);
        setError(e.message);
      }
    }
  };

  return (
    <Card>
      <Title>Confirm Logout</Title>
      <InfoBlock>All local data will be cleared. Confirm logout.</InfoBlock>
      <div className="h-8" />
      {error && (
        <ErrorBlock>
          <div>{error}</div>
        </ErrorBlock>
      )}
      <div>
        <ButtonFilled type="button" bgcolor="bg-red-500" onClick={handleLogout}>
          Yes, I wish to logout
        </ButtonFilled>
      </div>
    </Card>
  );
};

export default Logout;
