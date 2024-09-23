import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { useAuth } from '../contexts/authcontext';

import Header from '../components/Header';
import Footer from '../components/Footer';
import SetAdminPassword from '../components/SetAdminPassword';
import ButtonLink from '../components/ui/ButtonLink';
import Modal from '../components/ui/Modal';

const Welcome: React.FC = () => {
  // Create a ref to track the modal content
  const modalRef = useRef<HTMLDivElement>(null);

  // State to handle modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);

  // Context-related content
  const { setIsAdminPasswordSet } = useAuth();

  // Handlers to open and close the modal
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const onSuccess = () => {
    setIsAdminPasswordSet(true);
  };

// Close modal on outside click
useEffect(() => {
  const handleOutsideClick = (event: Event) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  if (showModal) {
    document.addEventListener('mousedown', handleOutsideClick);
  }

  return () => {
    document.removeEventListener('mousedown', handleOutsideClick);
  };
}, [showModal]);


  useEffect(() => {
    setTimeout(() => {
      handleShow();
    }, 3000);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-grow flex-col justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md flex flex-col">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Hello.</h1>
          <div className="text-gray-700 mb-6 font-thin">
            To get started, please set your admin password.
          </div>
          <div>
            <ButtonLink onClick={handleShow}>Tap to set password</ButtonLink>
          </div>
        </div>
      </div>
      <Footer />
      {showModal && (
        <Modal ref={modalRef}>
          <SetAdminPassword onSuccess={onSuccess} />
        </Modal>
      )}
    </div>
  );
};

export default Welcome;
