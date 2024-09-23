import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonFilledProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'button' | 'submit' | 'reset'; // Default button types
  children: ReactNode; // Children is required
  width?: string; // Optional width prop
  bgcolor?: string; // Optional background color prop
}

const ButtonFilled: React.FC<ButtonFilledProps> = ({
  type = 'button',
  children,
  width = 'w-full',
  bgcolor = 'bg-blue-600',
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`flex justify-center px-4 py-2 ${bgcolor} text-white font-semibold rounded-md shadow-sm  cursor-pointer disabled:cursor-not-allowed focus:outline-none ${width}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonFilled;
