import { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/authcontext';

import Card from '../components/ui/Card';
import Title from '../components/ui/Title';
import InputPassword from './ui/InputPassword';
import InputText from './ui/InputText';
import InfoBlock from './ui/InfoBlock';
import ErrorBlock from './ui/ErrorBlock';
import ButtonFilled from './ui/ButtonFilled';

interface SetAdminPasswordProps {
  onSuccess: () => void; // Function to handle success, no return value
}

const SetAdminPassword: React.FC<SetAdminPasswordProps> = ({ onSuccess }) => {
  // states inside the form
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // context related content
  const { baseUrl, X_REQUEST_STR } = useAuth();

  // Handler for form submit
  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    try {
      if (!password || !confirmPassword) {
        setError('Both password fields are required.');
      } else if (password !== confirmPassword) {
        setError('Passwords do not match.');
      } else if (password.length < 6) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(null);
        await axios.post(
          `${baseUrl}/api/auth/set-admin-password`,
          { password: password },
          { headers: { 'X-Requested-With': X_REQUEST_STR } }
        );
        onSuccess();
      }
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
      <Title>Set Admin Password</Title>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputPassword
          id="password"
          label="Admin Password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          placeholder="Enter a strong password"
          required
        />
        <InfoBlock>
          <div>Set a strong password of min 6 characters.</div>
        </InfoBlock>
        <InputText
          id="confirm-password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setConfirmPassword(e.target.value)
          }
          placeholder="Re-type your password"
          required
        />
        {error && (
          <ErrorBlock>
            <div>{error}</div>
          </ErrorBlock>
        )}
        <div>
          <ButtonFilled type="submit">
            <div>Set Password</div>
          </ButtonFilled>
        </div>
      </form>
    </Card>
  );
};

export default SetAdminPassword;
