import { forwardRef, TextareaHTMLAttributes } from 'react';

interface InputTextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  rows?: number;
}

const InputTextArea = forwardRef<HTMLTextAreaElement, InputTextAreaProps>(
  ({ id, label, rows = 4, ...rest }, ref) => {
    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <textarea
          id={id}
          name={id}
          ref={ref} // Forwarding the ref to the textarea element
          className="appearance-none w-full mt-1 block px-4 py-2 border border-gray-300 rounded-md bg-transparent text-gray-900 focus:outline-none focus:border-blue-500"
          autoComplete="off"
          rows={rows}
          {...rest}
        />
      </div>
    );
  }
);

export default InputTextArea;
