
import React from 'react';
import { SearchIcon, SettingsIcon } from './Icons';
import ServerStatus from './ServerStatus';

interface HeaderProps {
  projectName: string;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, onOpenCommandPalette, onOpenSettings }) => {
  return (
    <header className="flex-shrink-0 bg-slate-900/50 backdrop-blur-lg border-b border-slate-800 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">{projectName}</h2>
      </div>
      <div className="flex items-center gap-4">
        <ServerStatus />
        <button
            onClick={onOpenCommandPalette}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 w-72 text-slate-400 hover:text-white hover:border-slate-600 transition-colors flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <SearchIcon className="h-5 w-5" />
                <span>Quick search...</span>
            </div>
            <div className="flex items-center gap-1">
                <kbd className="font-sans text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5">⌘</kbd>
                <kbd className="font-sans text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5">K</kbd>
            </div>
        </button>
        <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors">
            <SettingsIcon className="w-6 h-6 text-slate-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center font-bold text-white">
          U
        </div>
      </div>
    </header>
  );
};

export default Header;
