
import React, { useState } from 'react';
import { Project, Integration, ActivityLogEntry, IntegrationProvider } from '../../types';
import { Card, Button } from '../UI';
import { GitHubIcon, GoogleDriveIcon, AwsIcon, DropboxIcon, CheckCircleIcon, ExclamationCircleIcon } from '../Icons';

const providerIcons: { [key in IntegrationProvider]: React.FC<{className?: string}> } = {
    'GitHub': GitHubIcon,
    'Google Drive': GoogleDriveIcon,
    'AWS S3': AwsIcon,
    'Dropbox': DropboxIcon,
};

const IntegrationCard: React.FC<{
    integration: Integration;
    onUpdate: (id: string, newStatus: 'Connected' | 'Disconnected') => void;
}> = ({ integration, onUpdate }) => {
    const Icon = providerIcons[integration.provider];
    const isConnected = integration.status === 'Connected';

    const handleToggle = () => {
        onUpdate(integration.id, isConnected ? 'Disconnected' : 'Connected');
    };

    return (
        <Card className="!p-4 hover:border-cyan-400/50">
            <div className="flex items-center gap-4">
                <Icon className="w-10 h-10 text-slate-300" />
                <div>
                    <h3 className="text-xl font-bold text-white">{integration.provider}</h3>
                    <p className="text-sm text-slate-400">{integration.account}</p>
                </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                        <ExclamationCircleIcon className="w-5 h-5 text-slate-500" />
                    )}
                    <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-slate-500'}`}>
                        {integration.status}
                    </span>
                </div>
                <Button 
                    variant={isConnected ? 'secondary' : 'primary'} 
                    onClick={handleToggle}
                    className={`text-sm py-1.5 px-4 ${isConnected ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' : ''}`}
                >
                    {isConnected ? 'Disconnect' : 'Connect'}
                </Button>
            </div>
        </Card>
    );
};

const IntegrationsView: React.FC<{ 
    project: Project;
    addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void;
    onUpdateIntegration: (integrationId: string, newStatus: 'Connected' | 'Disconnected') => void;
}> = ({ project, addLog, onUpdateIntegration }) => {

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Integrations & Services</h2>
                <p className="text-slate-400 mt-1">Connect to cloud and storage services to allow agents to interact with them.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.integrations.map(integration => (
                    <IntegrationCard 
                        key={integration.id} 
                        integration={integration}
                        onUpdate={onUpdateIntegration}
                    />
                ))}
            </div>
            
            <Card>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white">Looking for another service?</h3>
                    <p className="text-slate-400 mt-1">More integrations are coming soon. Let us know what you'd like to see next!</p>
                </div>
            </Card>
        </div>
    );
};

export default IntegrationsView;
