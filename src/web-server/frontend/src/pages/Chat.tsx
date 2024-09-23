// Chat.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { HiArrowCircleUp } from 'react-icons/hi';
import { FaRegSnowflake, FaThermometerHalf, FaFire } from 'react-icons/fa';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import ErrorBlock from '../components/ui/ErrorBlock';

interface AgentData {
  name: string;
  welcome_message: string;
  suggested_prompts: string[];
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'system';
}

const Chat: React.FC = () => {
  const { agentname } = useParams<{ agentname: string }>();
  const { baseUrl, X_REQUEST_STR } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [agentData, setAgentData] = useState<AgentData>({
    name: '',
    welcome_message: 'Hello! How can I help you today?',
    suggested_prompts: ['', '', ''],
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: uuidv4(),  content: agentData.welcome_message, role: 'system' },
  ]);
  const [input, setInput] = useState<string>('');

  // New state variables for temperature and response length
  const [temperature, setTemperature] = useState<number>(2); // 1: Low, 2: Medium, 3: High
  const [responseLength, setResponseLength] = useState<number>(2); // 1: Short, 2: Medium, 3: Long

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage: Message = { id: uuidv4(), content: input, role: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setLoading(true);

      const data = {
        input: input,
        messages: messages,
        temperature: temperature,
        response_length: responseLength,
      };

      try {
        const url = `/api/chat/${agentData.name}`;
        const headers = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/plain;charset=utf-8',
            'X-Requested-With': X_REQUEST_STR,
          },
        };
        const response = await axios.post(url, data, headers);
        console.log(response.data.content)
        const responseMessage: Message = {
          id: uuidv4(), 
          content: response.data.content.toString(),
          role: response.data.role,
        };
        setMessages((prevMessages) => [...prevMessages, responseMessage]);
      } catch (err) {
        console.error(err);
        setError('Failed to send message.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuggestedPrompt = (index: number) => {
    if (index >= 0 && index < agentData.suggested_prompts.length) {
      setInput(agentData.suggested_prompts[index]);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleResize = (entry: ResizeObserverEntry) => {
      setContainerHeight(entry.contentRect.height);
      window.parent.postMessage(
        { type: 'iframeHeight', height: entry.contentRect.height },
        window.location.origin
      );
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        handleResize(entry);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    if (agentname) {
      fetchAgentData(agentname);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [agentname]);

  const fetchAgentData = async (agentname: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${baseUrl}/api/chat/${agentname}`, {
        headers: { 'X-Requested-With': X_REQUEST_STR },
      });
      const data = response.data;
      if (data && data.agent) {
        // Ensure suggested_prompts has 3 elements
        if (data.agent.suggested_prompts.length < 3) {
          data.agent.suggested_prompts = [
            ...data.suggested_prompts,
            ...Array(3 - data.agent.suggested_prompts.length).fill(''),
          ];
        }
        if (data.agent.welcome_message) {
          const welcomeMessage: Message = {
            id: uuidv4(), 
            content: data.agent.welcome_message,
            role: 'system',
          };
          setMessages([welcomeMessage]);
        }
        const suggested_prompts_arr: string[] = data.agent.suggested_prompts ? data.agent.suggested_prompts.split(',').map((item: string) => item.trim().replace(/^"|"$/g, '')) : [];
        setAgentData({
            name: data.agent.name,
            welcome_message: data.agent.welcome_message,
            suggested_prompts:  suggested_prompts_arr
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load agent data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-max p-4 w-full">
      {/* Suggested Prompts */}
      <div className="flex flex-row gap-4 w-full mb-4">
        {agentData.suggested_prompts.map((prompt, index) => (
          <div
            key={index}
            onClick={() => handleSuggestedPrompt(index)}
            className="flex-1 cursor-pointer rounded-lg bg-gray-100 text-xs font-thin text-gray-800 p-4 border border-gray-200"
          >
            {prompt}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) =>
          message.role === 'user' ? (
            <div
              key={message.id}
              className="my-2 p-2 rounded-lg bg-gray-100 text-gray-800 self-end text-right max-w-[70%] ml-auto"
            >
              {message.content}
            </div>
          ) : (
            <div
              key={message.id}
              className="my-2 p-2 rounded-lg text-black self-start max-w-full mr-auto"
            >
              {message.content}
            </div>
          )
        )}
      </div>

      {/* Input Area */}
      {!loading && (
        <div className="flex items-center rounded-full bg-gray-100 px-4 py-2">

          {/* Response Length Selector */}
          <div className="flex items-center space-x-1 mr-2">
            <button
              className={`focus:outline-none ${
                responseLength === 1 ? 'text-green-500' : 'text-gray-400'
              }`}
              onClick={() => setResponseLength(1)}
              aria-label="Short Response"
            >
              <span className="text-sm">S</span>
            </button>
            <button
              className={`focus:outline-none ${
                responseLength === 2 ? 'text-green-500' : 'text-gray-400'
              }`}
              onClick={() => setResponseLength(2)}
              aria-label="Medium Response"
            >
              <span className="text-sm">M</span>
            </button>
            <button
              className={`focus:outline-none ${
                responseLength === 3 ? 'text-green-500' : 'text-gray-400'
              }`}
              onClick={() => setResponseLength(3)}
              aria-label="Long Response"
            >
              <span className="text-sm">L</span>
            </button>
          </div>

          {/* Text Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message your smart agent"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none overflow-hidden"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />

          {/* Send Button */}
          <button
            ref={buttonRef}
            className="cursor-pointer"
            onClick={handleSendMessage}
            aria-label="Send Message"
          >
            <HiArrowCircleUp className="text-3xl" />
          </button>
        </div>
      )}

      {/* Error and Loading Messages */}
      {error && <ErrorBlock>{error}</ErrorBlock>}
      {loading && (
        <div className="px-2 font-thin text-xs md:text-sm lg:text-md text-gray-800">
          Agent is working on your request...
        </div>
      )}
    </div>
  );
};

export default Chat;
