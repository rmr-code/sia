import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import AskAdminPassword from '../components/AskAdminPassword';

const Login = () => {
  // use navigate for post login success
  const navigate = useNavigate();

  // Create a ref to track the modal content
  const modalRef = useRef<HTMLDivElement>(null);

  // State to handle modal visibility
  const [showModal, setShowModal] = useState(false);

  // context related content
  const { setIsLoggedIn } = useAuth();

  // Handlers to open and close the modal
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const onSuccess = () => {
    setIsLoggedIn(true);
    navigate('/agents');
  };

  // UseEffect to handle changes in modal state
  useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      // Type guard to check if the event is a MouseEvent
      if (event instanceof MouseEvent) {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
        ) {
          handleClose(); // Close modal if clicked outside
        }
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal]);

  useEffect(() => {
    setTimeout(() => {
      handleShow();
    }, 2000);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-grow flex-col justify-center items-center bg-gray-50 p-8">
        <div className="w-full max-w-md flex flex-col">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Login.</h1>
          <div className="text-gray-700 mb-6 font-thin">
            Enter the admin password to set your agents.
          </div>
          <div>
            <button
              className="text-blue-700 font-nomral"
              onClick={() => handleShow()}
            >
              Tap to enter password
            </button>
          </div>
        </div>
      </div>
      <Footer />
      {showModal && (
        <Modal ref={modalRef}>
          <AskAdminPassword onSuccess={onSuccess} />
        </Modal>
      )}
    </div>
  );
};

export default Login;
