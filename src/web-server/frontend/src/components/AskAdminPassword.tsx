import { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authcontext';

import Card from '../components/ui/Card';
import Title from '../components/ui/Title';
import InputPassword from './ui/InputPassword';
import ErrorBlock from './ui/ErrorBlock';
import ButtonFilled from './ui/ButtonFilled';

interface AskAdminPasswordProps {
  onSuccess: () => void; // Define the type of the onSuccess prop
}

const AskAdminPassword: React.FC<AskAdminPasswordProps> = ({ onSuccess }) => {
  // states inside the form
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // context related content
  const { baseUrl, X_REQUEST_STR } = useAuth();

  // Handler for form submit
  const handleSubmit = async (
    ev: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    ev.preventDefault();
    try {
      setError(null);
      const username = 'admin';
      const response = await axios.post(
        `${baseUrl}/api/auth/login`,
        { username: username, password: password },
        {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        }
      );
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
      <Title>Enter Password</Title>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputPassword
          id="password"
          label="Admin Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="Enter the admin password"
          required
        />
        {error && (
          <ErrorBlock>
            <div>{error}</div>
          </ErrorBlock>
        )}
        <div>
          <ButtonFilled type="submit">
            <div>Submit Password</div>
          </ButtonFilled>
        </div>
      </form>
    </Card>
  );
};

export default AskAdminPassword;
