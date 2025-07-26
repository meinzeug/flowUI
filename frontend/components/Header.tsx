
import React, { useState, useRef, useEffect } from 'react';
import { SearchIcon, SettingsIcon, LogoutIcon } from './Icons';
import ServerStatus from './ServerStatus';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  projectName: string;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, onOpenCommandPalette, onOpenSettings }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(o => !o)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center font-bold text-white"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
              <div className="px-4 py-2 text-sm text-white">{user?.username}</div>
              <button
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                onClick={() => { setOpen(false); logout(); }}
              >
                <LogoutIcon className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
