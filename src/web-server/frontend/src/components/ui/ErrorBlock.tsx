import { ReactNode } from 'react';

interface ErrorBlockProps {
  children: ReactNode; // Required children prop
}

const ErrorBlock: React.FC<ErrorBlockProps> = ({ children }) => (
  <blockquote className="text-gray-800 border-l-4 border-red-600 pl-4 text-sm font-medium">
    {children}
  </blockquote>
);

export default ErrorBlock;
