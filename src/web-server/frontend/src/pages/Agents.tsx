import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import axios from 'axios';
import HeaderWithMenu from '../components/HeaderWithMenu';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import ButtonLink from '../components/ui/ButtonLink';
import InfoBlock from '../components/ui/InfoBlock';
import ErrorBlock from '../components/ui/ErrorBlock';
import { getErrorMessage } from '../util';
import toast, { Toaster } from 'react-hot-toast';
import Logout from '../components/Logout';
import ChangeAdminPassword from '../components/ChangeAdminPassword';
import { HiArrowRight } from "react-icons/hi";

interface Agent {
  name: string;
  [key: string]: any; // Other agent properties if they exist
}

const Agents: React.FC = () => {
  // use navigate for logout success
  const navigate = useNavigate();

  // context related content
  const { baseUrl, X_REQUEST_STR, setIsLoggedIn } = useAuth();

  // Create a ref to track the modal content
  const modalRef = useRef<HTMLDivElement>(null);
  // State to handle modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);
  // Handlers to open and close the modal
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  // menu options
  const [option, setOption] = useState<number | null>(null);
  const menu_options = [
    { label: 'Update Admin Password' },
    { label: 'Logout' },
  ];

  // Handler to act on header menu
  const handleMenuClick = (optionIndex: number) => {
    setOption(optionIndex);
    handleShow();
  };

  // Handler on successful logout
  const onLogoutSuccess = () => {
    setIsLoggedIn(false);
    navigate('/');
    handleClose();
  };

  // Handler on successful password change
  const onChangePasswordSuccess = () => {
    toast('Password updated');
    handleClose();
  };

  // List of agents related states & functions
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<String>('');

  // UseEffect to handle changes in modal state
  useEffect(() => {
    const handleOutsideClick = (event: Event) => {
      // Ensure modalRef and target exist
      if (modalRef.current && event.target instanceof Node) {
        // Check if the click is outside the modal
        if (!modalRef.current.contains(event.target)) {
          handleClose(); // Close modal if clicked outside
        }
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showModal]);


  // Fetch agents on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/agents`, {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        });
        const data = response.data;
        if (data && data.list) {
          setAgents(data.list);
        }
      } catch (error: any) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [baseUrl, X_REQUEST_STR]);

  return (
    <div className="flex flex-col h-screen">
      <HeaderWithMenu options={menu_options} onMenuClick={handleMenuClick} />
      <div className="flex flex-grow flex-col justify-start items-center bg-gray-50 p-4">
        <div className="w-full max-w-3xl">
          <div className="flex border-b border-gray-300">
            <div className="text-2xl font-semibold text-gray-800">List of Agents</div>
            <div className="flex-grow text-right">
              <Link to="/agent/">
                <ButtonLink>Create New Agent</ButtonLink>
              </Link>
            </div>
          </div>
          {agents.length === 0 && !error && (
            <div className="mt-4">
              <InfoBlock>No agent has been created.</InfoBlock>
            </div>
          )}
          {agents.length > 0 && (
            <div className="flex flex-col gap-4 mt-4">
              {agents.map((ag, index) => (
                <Link to={`/agent/${ag.name}`} key={index}>
                  <div className="flex gap-4 text-xl font-normal items-center">
                    <span className="text-gray-800">{index + 1}.</span>
                    <span className="text-blue-600 font-medium">{ag.name}</span>
                    <span className="flex-1"></span>
                    <Link to={`/demo/${ag.name}`} className="cursor-pointer"><div className="flex p-4 gap-2 items-center">
                      <span className="text-blue-600">demo</span>
                      <HiArrowRight />
                    </div>
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {error && (
            <div className="mt-4">
              <ErrorBlock>{error}</ErrorBlock>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={{
          duration: 2000,
        }}
      />
      {showModal && (
        <Modal ref={modalRef}>
          {option === 0 && (
            <ChangeAdminPassword onSuccess={onChangePasswordSuccess} />
          )}
          {option === 1 && <Logout onSuccess={onLogoutSuccess} />}
        </Modal>
      )}
    </div>
  );
};

export default Agents;
