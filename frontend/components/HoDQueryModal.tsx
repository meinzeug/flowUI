import React, { useState } from 'react';
import { Modal, Button, Loader } from './UI';
import { HoDQueryContext } from '../types';
import { HeadOfDevIcon, PaperAirplaneIcon } from './Icons';

const marked = (text: string) => {
    if (!text) return '';
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-cyan-400 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b-2 border-slate-700 pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
        .replace(/\n/g, '<br />');

    html = html.replace(/<\/li><br \/>/g, '</li>');
    html = html.replace(/(<li.*>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br \/><ul>/g, '');

    return html;
};


interface HoDQueryModalProps {
    isOpen: boolean;
    onClose: () => void;
    context: HoDQueryContext | null;
    onQuery: (query: string) => void;
    response: string;
    status: 'idle' | 'thinking';
}

const HoDQueryModal: React.FC<HoDQueryModalProps> = ({ isOpen, onClose, context, onQuery, response, status }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = () => {
        if (query.trim()) {
            onQuery(query);
            setQuery('');
        }
    };

    if (!context) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Query AI Head of Development">
            <div className="space-y-4">
                <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-sm text-slate-400">Querying {context.type}:</p>
                    <p className="font-bold text-white">{context.name}</p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={`e.g., What's the current status?`}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={status === 'thinking'}
                    />
                    <Button onClick={handleSubmit} disabled={status === 'thinking' || !query.trim()} className="h-[50px]">
                       <PaperAirplaneIcon className="w-5 h-5"/>
                    </Button>
                </div>

                {(status === 'thinking' || response) && (
                    <div className="mt-4 border-t border-slate-700/50 pt-4">
                        <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><HeadOfDevIcon className="w-6 h-6"/> HoD Report</h4>
                        {status === 'thinking' ? (
                            <Loader text="Analyzing..." />
                        ) : (
                            <div className="prose prose-sm prose-invert bg-slate-800/50 p-4 rounded-lg max-h-64 overflow-y-auto" dangerouslySetInnerHTML={{ __html: marked(response) }} />
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default HoDQueryModal;