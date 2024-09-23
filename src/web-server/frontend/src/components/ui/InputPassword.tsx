import { InputHTMLAttributes } from 'react';

interface InputPasswordProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string; // Required id prop
  label: string; // Required label prop
}

const InputPassword: React.FC<InputPasswordProps> = ({
  id,
  label,
  ...rest
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="password"
        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
        autoComplete="off"
        {...rest} // Spread the rest of the input props
      />
    </div>
  );
};

export default InputPassword;
