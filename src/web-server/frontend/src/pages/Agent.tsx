import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/authcontext';
import { useParams, Link } from 'react-router-dom';

import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

import Logo from '../components/Logo';
import Footer from '../components/Footer';
import Modal from '../components/ui/Modal';
import NameView from '../components/agent/NameView';
import NameEdit from '../components/agent/NameEdit';
import InstructionsView from '../components/agent/InstructionsView';
import InstructionsEdit from '../components/agent/InstructionsEdit';
import WelcomeMessageView from '../components/agent/WelcomeMessageView';
import WelcomeMessageEdit from '../components/agent/WelcomeMessageEdit';
import SuggestedPromptsView from '../components/agent/SuggestedPromptsView';
import SuggestedPromptsEdit from '../components/agent/SuggestedPromptsEdit';
import FilesView from '../components/agent/FilesView';
import FilesEdit from '../components/agent/FilesEdit';
import ButtonFilled from '../components/ui/ButtonFilled';
import ButtonPlain from '../components/ui/ButtonPlain';
import InfoBlock from '../components/ui/InfoBlock';
import ErrorBlock from '../components/ui/ErrorBlock';
import { getErrorMessage } from '../util';

// Define the type for your agent data
interface AgentDataType {
  name: string;
  instructions: string;
  welcome_message: string;
  suggested_prompts: string;
  files: string;
  status: string;
  embeddings_status: string;
  created_on: number | null;
  updated_on: number | null;
}

const Agent: React.FC = () => {
  const { agentname } = useParams<Record<string, string | undefined>>();

  // State for agent data and form inputs
  const [agentData, setAgentData] = useState<AgentDataType>({
    name: '',
    instructions: '',
    welcome_message: '',
    suggested_prompts: '',
    files: '',
    status: '',
    embeddings_status: '',
    created_on: null,
    updated_on: null,
  });
  const [name, setName] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string>('');
  const [files, setFiles] = useState<string>('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string>('');
  const [embeddingsStatus, setEmbeddingsStatus] = useState<string>('');

  // State for UI interactions
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // state when changes have been made
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [field, setField] = useState<string | null>(null);

  const { baseUrl, X_REQUEST_STR } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Placeholders for fields
  const namePlaceholder = 'set-a-name';
  const instructionsPlaceholder = `
This is an example of an instruction:

Follow the **below** instructions:  
1. You are an expert in policy analysis. Answer questions based solely on the provided documents.
2. If the information is insufficient, ask for more details.
3. Do not speculate or provide information that is not explicitly found in the documents. If multiple possible answers exist, list the options.
`;
  const welcomeMessagePlaceholder = `
This is an example of a welcome message:

Welcome to the **Insurance Policy Assistant**!
I’m here to help you navigate your insurance needs and provide expert advice on various policy matters. Whether you’re looking for information on coverage options, policy terms, claim processes, or any other insurance-related questions, I’m here to assist you.
`;
  const suggestedPromptsPlaceholder = `How do I file a claim for car damage?, Can I change my beneficiaries on my life insurance policy?, Is flood damage covered under my homeowner’s insurance?`;
  const filesPlaceholder = 'Here you should upload all files that you would like the agent to process to serve its needs.';

  // Editable fields
  const fields = useMemo(
    () =>
      [
        !agentname && 'name',
        'instructions',
        'welcomeMessage',
        'suggestedPrompts',
        'files',
      ].filter(Boolean) as string[],
    [agentname]
  );

  const prevField = useMemo(() => {
    const index = fields.indexOf(field!);
    return index > 0 ? fields[index - 1] : '';
  }, [field, fields]);

  const nextField = useMemo(() => {
    const index = fields.indexOf(field!);
    return index >= 0 && index < fields.length - 1 ? fields[index + 1] : '';
  }, [field, fields]);

  // Modal handlers
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

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

  // Initial load effect
  useEffect(() => {
    if (!agentname) {
      toast('The above content is placeholder text to serve as an example.');
      setTimeout(() => {
        setField('name');
        handleShow();
      }, 5000);
    }
  }, [agentname]);

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/agents/${agentname}`, {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        });
        const data = response.data;
        if (data && data.agent) {
          setAgentData(data.agent);
          setName(data.agent.name);
          setInstructions(data.agent.instructions);
          setWelcomeMessage(data.agent.welcome_message);
          setSuggestedPrompts(data.agent.suggested_prompts);
          setFiles(data.agent.files);
          setEmbeddingsStatus(data.agent.embeddings_status);
        }
      } catch (error: any) {
        setError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    if (agentname) {
      fetchAgent();
    }
  }, [baseUrl, X_REQUEST_STR, agentname]);

  // Edit handlers
  const handleEdit = (fieldName: string) => {
    setField(fieldName);
    handleShow();
  };

  const storeName = (value: string, nextField: string | null) => {
    setIsEditMode(true);
    setName(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeInstructions = (value: string, nextField: string | null) => {
    setIsEditMode(true);
    setInstructions(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeWelcomeMessage = (value: string, nextField: string | null) => {
    setIsEditMode(true);
    setWelcomeMessage(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeSuggestedPrompts = (value: string, nextField: string | null) => {
    setIsEditMode(true);
    setSuggestedPrompts(value);
    nextField ? handleEdit(nextField) : handleClose();
  };

  const storeFiles = (newFilesList: File[], deletedFilesList: string, nextField: string | null) => {
    setIsEditMode(true);
    setNewFiles(newFilesList);
    setDeletedFiles(deletedFilesList);
    nextField ? handleEdit(nextField) : handleClose();
  };

  // Reset handler
  const handleReset = () => {
    setName(agentData.name);
    setInstructions(agentData.instructions);
    setWelcomeMessage(agentData.welcome_message);
    setSuggestedPrompts(agentData.suggested_prompts);
    setFiles(agentData.files);
    setNewFiles([]);
    setDeletedFiles('');
    setIsEditMode(false);
  };

  // Save handler
  const handleSave = async () => {
    setError("");
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('instructions', instructions);
      formData.append('welcome_message', welcomeMessage);
      formData.append('suggested_prompts', suggestedPrompts);
      newFiles.forEach((file) => {
        formData.append('new_files', file);
      });
      formData.append('deleted_files', deletedFiles);

      const response = agentname
        ? await axios.put(`${baseUrl}/api/agents/${agentname}`, formData, {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        })
        : await axios.post(`${baseUrl}/api/agents`, formData, {
          withCredentials: true,
          headers: { 'X-Requested-With': X_REQUEST_STR },
        });

      const data = response.data;
      if (data && data.agent) {
        setAgentData(data.agent);
        setName(data.agent.name);
        setInstructions(data.agent.instructions);
        setWelcomeMessage(data.agent.welcome_message);
        setSuggestedPrompts(data.agent.suggested_prompts);
        setFiles(data.agent.files);
        setEmbeddingsStatus(data.agent.embeddings_status);
        setNewFiles([]);
        setDeletedFiles('');
        setIsEditMode(false);
      }
    } catch (error: any) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    window.location.reload();
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-50 p-4">
        <div className="container max-w-4xl mx-auto flex items-center">
          <Logo />
          <div className="flex-1" />
          <div className="flex gap-4">
            {!isEditMode && (
              <Link to="/agents">
                <ButtonPlain width="auto">Return to Agents</ButtonPlain>
              </Link>
            )}
            {embeddingsStatus &&
              <ButtonFilled width="auto" onClick={handleRefresh}>Refresh</ButtonFilled>
            }
            {!embeddingsStatus && isEditMode && !agentData.name && (
              <>
                <Link to="/agents">
                  <ButtonPlain>Return to Agents</ButtonPlain>
                </Link>
                <ButtonFilled width="auto" onClick={handleSave}>
                  Save
                </ButtonFilled>
              </>
            )}
            {!embeddingsStatus && isEditMode && agentData.name && (
              <>
                <ButtonPlain onClick={handleReset}>Reset</ButtonPlain>
                <ButtonFilled width="auto" onClick={handleSave}>
                  Save
                </ButtonFilled>
              </>
            )}
          </div>
        </div>
        {error &&
          <div className="float-right pr-4">
            <ErrorBlock>{error}</ErrorBlock>
          </div>
        }
        {embeddingsStatus &&
          <div className="float-right pr-4">
            <InfoBlock>Files are being processed ...</InfoBlock>
          </div>
        }

      </header>
      <div className="flex flex-grow flex-col items-center bg-gray-50 p-8">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <NameView
            data={agentData.name}
            value={name}
            placeholder={agentData.name ? '' : namePlaceholder}
            canEdit={!agentname}
            onEdit={() => handleEdit('name')}
            className="border-b border-gray-300 pb-2"
          />
          <InstructionsView
            data={agentData.instructions}
            value={instructions}
            placeholder={agentData.name ? '' : instructionsPlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('instructions')}
          />
          <WelcomeMessageView
            data={agentData.welcome_message}
            value={welcomeMessage}
            placeholder={agentData.name ? '' : welcomeMessagePlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('welcomeMessage')}
          />
          <SuggestedPromptsView
            data={agentData.suggested_prompts}
            value={suggestedPrompts}
            placeholder={agentData.name ? '' : suggestedPromptsPlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('suggestedPrompts')}
          />
          <FilesView
            files={files}
            new_files={newFiles}
            deleted_files={deletedFiles}
            placeholder={agentData.name ? '' : filesPlaceholder}
            canEdit={!embeddingsStatus}
            onEdit={() => handleEdit('files')}
          />
        </div>
      </div>
      <Footer />
      <Toaster
        position="bottom-center"
        gutter={8}
        toastOptions={{
          className: 'text-center',
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      {showModal && (
        <Modal ref={modalRef}>
          {field === 'name' && (
            <NameEdit
              value={name}
              onSuccess={storeName}
              next={nextField}
              prev={prevField}
            />
          )}
          {field === 'instructions' && (
            <InstructionsEdit
              value={instructions}
              onSuccess={storeInstructions}
              next={nextField}
              prev={prevField}
            />
          )}
          {field === 'welcomeMessage' && (
            <WelcomeMessageEdit
              value={welcomeMessage}
              onSuccess={storeWelcomeMessage}
              next={nextField}
              prev={prevField}
            />
          )}
          {field === 'suggestedPrompts' && (
            <SuggestedPromptsEdit
              value={suggestedPrompts}
              onSuccess={storeSuggestedPrompts}
              next={nextField}
              prev={prevField}
            />
          )}
          {field === 'files' && (
            <FilesEdit
              files={files}
              new_files={newFiles}
              deleted_files={deletedFiles}
              onSuccess={storeFiles}
              next={nextField}
              prev={prevField}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default Agent;