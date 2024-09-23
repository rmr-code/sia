import React, { createContext, useState, useContext, ReactNode } from 'react';

// BaseURL
/*
This is used to form the axios calls to the backend
*/
//const baseUrl = 'http://localhost:8080'; // uncomment for development
const baseUrl = window.location.origin; // uncomment for production

// X_REQUEST_STR
/*
This is checked by all api requests to ensure that they have been made from the app
*/
const X_REQUEST_STR = 'XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl';

// Define the type for the context value
interface AuthContextType {
  isAdminPasswordSet: boolean;
  setIsAdminPasswordSet: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  baseUrl: string;
  X_REQUEST_STR: string;
}

// Create context with a default value of `undefined`
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Define the props type for the provider (children must be ReactNode)
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component to wrap the app
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAdminPasswordSet, setIsAdminPasswordSet] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Wrap the app in this provider and expose the state as well as set methods to all children
  return (
    <AuthContext.Provider
      value={{
        isAdminPasswordSet,
        setIsAdminPasswordSet,
        isLoggedIn,
        setIsLoggedIn,
        baseUrl,
        X_REQUEST_STR,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
