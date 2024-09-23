import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import axios from 'axios';
// import css
import './index.css';
// import context
import { AuthProvider, useAuth } from './contexts/authcontext';
// import pages
import Loading from './pages/Loading';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Agents from './pages/Agents';
import Agent from './pages/Agent';
import Invalid from './pages/Invalid';
import Demo from './pages/Demo';
import Chat from './pages/Chat';

const AppContent: React.FC = () => {
  const navigate = useNavigate(); // to navigate to other routes

  // the below 2 states are received from auth context
  const {
    isAdminPasswordSet,
    isLoggedIn,
    setIsAdminPasswordSet,
    setIsLoggedIn,
    baseUrl,
    X_REQUEST_STR,
  } = useAuth();

  // other states
  const [loading, setLoading] = useState<boolean>(true); // while loading
  const [error, setError] = useState<boolean>(false); 

  useEffect(() => {
    // function to check if the admin password is set on the first load
    const checkAdminPasswordStatus = async (): Promise<void> => {
      try {
        // the credentials are not passed for this call
        // because it may be the first time the app is used by someone
        const response = await axios.get(
          `${baseUrl}/api/auth/is-admin-password-set`,
          {
            headers: { 'X-Requested-With': X_REQUEST_STR },
          }
        );
        const data = response.data;
        // check the response
        if (data.admin_password_set) {
          // set the state
          setIsAdminPasswordSet(true);
          // then, check if JWT token is set
          await checkJWTToken();
        }
      } catch (error: unknown) {
        setError(true);
        // Handle Errors
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Server responded with a status other than 200 range
            console.error('Error response:', error.response); // Response data from the server
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
          }
        } else if (error instanceof Error) {
          // Something else happened in setting up the request
          console.error('Error:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Function to check the JWT token via the cookie
    const checkJWTToken = async (): Promise<void> => {
      try {
        // credentials are passed if present as a http-only cookie
        await axios.get(`${baseUrl}/api/auth/check-token`, {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        });
        // if no error set state
        setIsLoggedIn(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            // Server responded with a status other than 200 range
            console.error('Error response:', error.response); // Response data from the server
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
          }
        } else if (error instanceof Error) {
          // Something else happened in setting up the request
          console.error('Error:', error.message);
        } else {
          console.error('An unexpected error occurred');
        }
      }
    };

    // call the admin password check
    checkAdminPasswordStatus();
  }, [setIsAdminPasswordSet, setIsLoggedIn, baseUrl, X_REQUEST_STR]);

  // if error
  if (error) {
    return <Invalid/>
  }

  // If still loading, don't render any routes
  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      {!isAdminPasswordSet ? (
        <>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="*" element={<Navigate to="/welcome" />} />
        </>
      ) : !isLoggedIn ? (
        <>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat/:agentname" element={<Chat/>} />
          <Route path="/chat" element={<Navigate to="/Invalid" replace />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/agents" replace />} />
          <Route path="/agents/" element={<Agents />} />
          <Route path="/agent/:agentname" element={<Agent />} />
          <Route path="/agent/" element={<Agent />} />
          <Route path="/demo/:agentname" element={<Demo/>} />
          <Route path="/chat/:agentname" element={<Chat/>} />
          <Route path="/chat" element={<Navigate to="/Invalid" replace />} />
          <Route path="*" element={<Invalid />} />
        </>
      )}
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
