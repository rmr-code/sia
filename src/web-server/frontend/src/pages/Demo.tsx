import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import ButtonPlain from '../components/ui/ButtonPlain';

const Demo: React.FC = () => {
    const { agentname } = useParams<Record<string, string | undefined>>();

    const iframeref = useRef<HTMLIFrameElement | null>(null);
    const deltaH = 36 // to match the p-4 in chat + border-1
    const [frameheight, setFrameheight] = useState(`${deltaH}px`)

    useEffect(() => {
        const handleIframeMessage = (event: MessageEvent) => {
            if (event.data.type === "iframeHeight") {
                setFrameheight(`${event.data.height + deltaH}px`);
            }
        };

        window.addEventListener("message", handleIframeMessage);
        return () => window.removeEventListener("message", handleIframeMessage);
    }, [])

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-gray-50 p-4">
                <div className="container max-w-4xl mx-auto flex items-center">
                    <Logo />
                    <div className="flex-1" />
                    <div className="flex gap-4">
                        <Link to="/agents">
                            <ButtonPlain width="auto">Return to Agents</ButtonPlain>
                        </Link>
                    </div>
                </div>
            </header>
            <div className="flex flex-grow flex-col justify-start items-center bg-gray-50 p-4">
                <div className="w-full max-w-3xl">
                    <div className="flex flex-col border-b border-gray-300 pb-2">
                        <div className="text-2xl font-semibold text-gray-800">{`Demo of ${agentname}`}</div>
                        <div className="text-sm font-light text-gray-800">The below content is of the chat iframe</div>
                    </div>
                </div>
                <iframe ref={iframeref} className='w-full max-w-3xl overflow-hidden' width="100%" height={frameheight} src={`/chat/${agentname}`} />
            </div>
            <Footer />
        </div>
    );
}

export default Demo;