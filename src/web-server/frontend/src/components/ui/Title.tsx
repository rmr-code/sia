import { ReactNode } from 'react';

interface TitleProps {
  className?: string; // Optional className prop
  children: ReactNode; // Required children prop
}

const Title: React.FC<TitleProps> = ({ className = '', children }) => {
  return (
    <div
      className={`text-2xl font-semibold text-gray-800 mb-6 text-center ${className}`}
    >
      {children}
    </div>
  );
};

export default Title;
