
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6 transition-all duration-300 ${className} ${onClick ? 'cursor-pointer hover:border-cyan-400/50' : ''}`}
  >
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-6 py-2.5 font-bold rounded-xl text-white transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-cyan-500 to-fuchsia-500 hover:from-cyan-400 hover:to-fuchsia-400 shadow-cyan hover:shadow-cyan-lg',
    secondary: 'bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 focus:ring-cyan-400',
    ghost: 'bg-transparent hover:bg-slate-700/50 focus:ring-cyan-400'
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="animate-fade-in-up bg-slate-900 border border-slate-700 rounded-2xl shadow-lg w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="p-6">
            {children}
        </div>
      </div>
    </div>
  );
};

export const Loader: React.FC<{ text?: string }> = ({ text = "Processing..." }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-8">
    <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
    <p className="text-cyan-400 font-medium">{text}</p>
  </div>
);

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleProps> = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        enabled ? 'bg-cyan-500' : 'bg-slate-600'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
};
