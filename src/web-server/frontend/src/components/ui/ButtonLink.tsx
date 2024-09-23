import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonLinkProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode; // Required children prop
  size?: string; // Optional size prop
}

const ButtonLink: React.FC<ButtonLinkProps> = ({
  children,
  size = 'text-base',
  ...rest
}) => {
  return (
    <button
      className={`text-blue-700 font-medium hover:bg-gray-100 p-2 cursor-pointer disabled:cursor-not-allowed ${size}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonLink;
