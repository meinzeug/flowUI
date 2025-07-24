
import React, { useState, useEffect, useMemo } from 'react';
import { Command } from '../types';
import { SearchIcon } from './Icons';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: Command[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    const filteredCommands = useMemo(() => {
        if (!searchTerm) return commands;
        return commands.filter(command =>
            command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            command.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, commands]);

    useEffect(() => {
        setActiveIndex(0);
    }, [filteredCommands]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const command = filteredCommands[activeIndex];
                if (command) {
                    command.action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, activeIndex, filteredCommands, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-lg animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
                style={{ animationDuration: '300ms' }}
            >
                <div className="relative p-4 border-b border-slate-700">
                    <SearchIcon className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Type a command or search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full bg-transparent text-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none"
                    />
                </div>
                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                         <ul>
                            {filteredCommands.map((command, index) => (
                                <li
                                    key={command.id}
                                    onClick={() => { command.action(); onClose(); }}
                                    className={`flex items-center justify-between gap-4 p-4 rounded-lg cursor-pointer ${
                                        index === activeIndex ? 'bg-cyan-500/10' : 'hover:bg-slate-700/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-cyan-400">{command.icon}</div>
                                        <div>
                                            <p className="font-semibold text-white">{command.name}</p>
                                            <p className="text-sm text-slate-400">{command.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs capitalize text-slate-500 bg-slate-700 px-2 py-1 rounded">{command.type}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-400 p-8">No commands found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
