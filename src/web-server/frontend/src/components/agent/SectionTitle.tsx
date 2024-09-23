import { ReactNode } from 'react';

interface SectionTitleProps {
  className?: string; // Optional className prop
  children: ReactNode; // Required children prop
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  className = '',
  children,
}) => {
  return (
    <div className={`text-2xl font-semibold text-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export default SectionTitle;
