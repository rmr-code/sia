import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonPlainProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset'; // Default button types
  children: ReactNode; // Children is required
  width?: string; // Optional width prop
  bgcolor?: string; // Optional background color prop
}

const ButtonPlain: React.FC<ButtonPlainProps> = ({
  type = 'button',
  children,
  width = 'auto',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`flex justify-center px-4 py-2 text-gray-800 font-semibold rounded-md cursor-pointer disabled:cursor-not-allowed hover:bg-gray-200 focus:outline-none ${width}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonPlain;
