import React, { useState, useEffect, useRef } from 'react';
import { AssistantStatus, ChatMessage } from '../types';
import { MicrophoneIcon, SettingsIcon, PaperAirplaneIcon, XIcon, LogoIcon } from './Icons';

// Type declarations for the Web Speech API
interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    serviceURI: string;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    readonly isFinal: boolean;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromURI(src: string, weight?: number): void;
    addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
    src: string;
    weight: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionConstructor {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

interface AssistantProps {
    status: AssistantStatus;
    chatHistory: ChatMessage[];
    onProcessCommand: (command: string) => void;
    language: string;
    onOpenSettings: () => void;
    isEnabled: boolean;
}

const Assistant: React.FC<AssistantProps> = ({ status, chatHistory, onProcessCommand, language, onOpenSettings, isEnabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userInput, setUserInput] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat history when new messages are added
    useEffect(() => {
        if (chatHistoryRef.current) {
            const innerDiv = chatHistoryRef.current.children[0];
            if (innerDiv) {
                chatHistoryRef.current.scrollTop = 0; // Since it's flex-column-reverse
            }
        }
    }, [chatHistory]);

    // Initialize Speech Recognition API
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            recognitionRef.current = new SpeechRecognitionAPI();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.maxAlternatives = 1;
        } else {
            console.warn("Speech Recognition API is not supported in this browser.");
        }
    }, []);
    
    // Update recognition language
    useEffect(() => {
        if(recognitionRef.current) {
            recognitionRef.current.lang = language;
        }
    }, [language]);

    // Handle speech recognition events
    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        const handleResult = (event: SpeechRecognitionEvent) => {
            const command = event.results[0][0].transcript;
            onProcessCommand(command);
        };
        const handleStart = () => setIsListening(true);
        const handleEnd = () => setIsListening(false);
        const handleError = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error, event.message);
            setIsListening(false);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                 onProcessCommand("!ERROR:MIC_PERMISSION_DENIED");
            }
        };

        recognition.addEventListener('result', handleResult as EventListener);
        recognition.addEventListener('start', handleStart);
        recognition.addEventListener('end', handleEnd);
        recognition.addEventListener('error', handleError as EventListener);
        return () => {
            recognition.removeEventListener('result', handleResult as EventListener);
            recognition.removeEventListener('start', handleStart);
            recognition.removeEventListener('end', handleEnd);
            recognition.removeEventListener('error', handleError as EventListener);
        };
    }, [onProcessCommand]);

    const handleMicClick = () => {
        if (!isEnabled) { onOpenSettings(); return; }
        const recognition = recognitionRef.current;
        if (!recognition) { onProcessCommand("!ERROR:NO_SPEECH_RECOGNITION"); return; }
        if (isListening) { recognition.stop(); } 
        else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
                recognition.start();
            }).catch(() => {
                onProcessCommand("!ERROR:MIC_PERMISSION_DENIED");
            });
        }
    };

    const handleSend = () => {
        if (userInput.trim() && status !== 'thinking') {
            onProcessCommand(userInput.trim());
            setUserInput('');
        }
    };

    if (!isEnabled) {
         return (
             <div className="assistant-panel">
                <button
                    onClick={onOpenSettings}
                    className={'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-4 ring-offset-[#050608] ring-cyan-500 bg-slate-800 hover:bg-slate-700 animate-pulsate'}
                    aria-label="Configure AI Assistant"
                >
                    <SettingsIcon className="w-8 h-8 text-white" />
                </button>
             </div>
         )
    }

    const currentDisplayStatus = isListening ? 'listening' : status;

    const orbClasses = `w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ring-offset-4 ring-offset-[#050608] ${
        currentDisplayStatus === 'listening' ? 'bg-fuchsia-600 shadow-fuchsia-lg animate-listening scale-110' :
        currentDisplayStatus === 'thinking' ? 'bg-gradient-to-br from-fuchsia-600 to-indigo-600 shadow-indigo-lg animate-thinking' :
        currentDisplayStatus === 'speaking' ? 'bg-cyan-500 shadow-cyan-lg animate-pulsate' :
        'bg-slate-800 hover:bg-slate-700 animate-pulsate'
    }`;
    
    const micButtonClasses = `p-3 rounded-full transition-colors ${
        isListening ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'text-slate-400 hover:text-white'
    }`;

    return (
        <div className="assistant-panel">
            {isOpen ? (
                <div className="assistant-chat-window animate-fade-in-up" style={{animationDuration: '300ms'}}>
                    <div className="assistant-chat-header">
                        <div className="flex items-center gap-3">
                            <LogoIcon className="w-8 h-8"/>
                            <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-slate-700/50" aria-label="Open Assistant Settings"><SettingsIcon className="w-5 h-5 text-slate-400" /></button>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-700/50" aria-label="Close Chat"><XIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                    </div>
                    <div className="assistant-chat-history" ref={chatHistoryRef}>
                        <div className="chat-history-inner">
                            {chatHistory.slice().reverse().map(msg => (
                                <div key={msg.id} className={`assistant-chat-bubble ${msg.role}`}>
                                    {msg.content}
                                    {msg.suggestions && (
                                        <div className="mt-3 -mb-1">
                                            {msg.suggestions.map(suggestion => (
                                                <button key={suggestion.command} onClick={() => onProcessCommand(suggestion.command)} className="assistant-suggestion-chip">{suggestion.text}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="assistant-input-area">
                        <div className="assistant-input-wrapper">
                            <textarea
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Type a command..."
                                className="assistant-text-input"
                                rows={1}
                                disabled={status === 'thinking'}
                            />
                            <button onClick={handleMicClick} className={micButtonClasses} aria-label="Use Microphone"><MicrophoneIcon className="w-6 h-6"/></button>
                            <button onClick={handleSend} className="p-3 rounded-full bg-cyan-500 text-white disabled:bg-slate-600" aria-label="Send Message" disabled={!userInput.trim() || status === 'thinking'}><PaperAirplaneIcon className="w-6 h-6"/></button>
                        </div>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className={orbClasses} aria-label="Open AI Assistant Chat">
                    <LogoIcon className="w-10 h-10" />
                </button>
            )}
        </div>
    );
};

export default Assistant;