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

interface ChangeAdminPasswordProps {
  onSuccess: () => void; // Function to handle success
}

const ChangeAdminPassword: React.FC<ChangeAdminPasswordProps> = ({
  onSuccess,
}) => {
  // states inside the form
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [repeatNewPassword, setRepeatNewPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // context related content
  const { baseUrl, X_REQUEST_STR } = useAuth();

  // Handler for form submit
  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    try {
      setError(null);

      // Validate new passwords
      if (!currentPassword || !newPassword || !repeatNewPassword) {
        setError('All fields are required.');
        return;
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }

      if (newPassword !== repeatNewPassword) {
        setError('New passwords do not match.');
        return;
      }

      // Make an API call to update the password
      await axios.post(
        `${baseUrl}/api/auth/change-admin-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
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
      <Title>Change Admin Password</Title>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputPassword
          id="current-password"
          label="Current Password"
          value={currentPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setCurrentPassword(e.target.value)
          }
          placeholder="Enter the current password"
          required
        />
        <InputPassword
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setNewPassword(e.target.value)
          }
          placeholder="Enter a new password"
          required
        />
        <InfoBlock>
          <div>Set a strong password of min 6 characters.</div>
        </InfoBlock>
        <InputText
          id="confirm-password"
          label="Repeat new Password"
          value={repeatNewPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setRepeatNewPassword(e.target.value)
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
            <div>Update Password</div>
          </ButtonFilled>
        </div>
      </form>
    </Card>
  );
};

export default ChangeAdminPassword;
