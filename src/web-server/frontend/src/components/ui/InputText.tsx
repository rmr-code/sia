import { forwardRef, InputHTMLAttributes } from 'react';

interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string; // Required id prop
  label: string; // Required label prop
}

const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  ({ id, label, ...rest }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          name={id}
          type="text"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 sm:text-sm"
          autoComplete="off"
          {...rest} // Spread the rest of the input props
        />
      </div>
    );
  }
);

export default InputText;
