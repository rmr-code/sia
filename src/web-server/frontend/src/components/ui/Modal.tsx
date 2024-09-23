import React, { forwardRef, ReactNode } from 'react';

// Define the props interface
interface ModalProps {
  children: ReactNode; // Required children prop
}

// Define the Modal component and use forwardRef to pass the ref to the DOM element
const Modal = forwardRef<HTMLDivElement, ModalProps>(({ children }, ref) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        ref={ref}
        className="flex flex-col justify-center items-center w-full max-w-xl min-w-sm p-4 max-h-[36rem] min-h-[12rem] overflow-auto"
      >
        {children}
      </div>
    </div>
  );
});

export default Modal;
