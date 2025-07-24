
import React, { useEffect } from 'react';
import { Toast } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, InfoCircleIcon, XIcon } from './Icons';

const toastConfig = {
    success: {
        icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
        barClass: 'bg-green-400',
    },
    error: {
        icon: <ExclamationCircleIcon className="h-6 w-6 text-red-400" />,
        barClass: 'bg-red-400',
    },
    info: {
        icon: <InfoCircleIcon className="h-6 w-6 text-cyan-400" />,
        barClass: 'bg-cyan-400',
    },
    warning: {
        icon: <ExclamationCircleIcon className="h-6 w-6 text-yellow-400" />,
        barClass: 'bg-yellow-400',
    }
};

interface ToastMessageProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const ToastMessage: React.FC<ToastMessageProps> = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onDismiss]);

    const config = toastConfig[toast.type];

    return (
        <div 
          className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-lg flex items-center w-full max-w-sm overflow-hidden animate-fade-in-up"
          style={{ animationDuration: '300ms' }}
        >
            <div className={`w-2 h-full ${config.barClass}`} />
            <div className="p-4 flex items-center gap-4 flex-grow">
                {config.icon}
                <p className="text-white font-medium">{toast.message}</p>
            </div>
            <button onClick={() => onDismiss(toast.id)} className="p-4 text-slate-500 hover:text-white">
                <XIcon className="h-5 w-5" />
            </button>
        </div>
    );
};


interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-5 right-5 z-50 space-y-4">
            {toasts.map(toast => (
                <ToastMessage key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};