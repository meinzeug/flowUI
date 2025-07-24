
import React, { useState, useEffect } from 'react';
import { Project, ApiKeyEntry, ApiProvider, ActivityLogEntry } from '../../types';
import { Card, Button } from '../UI';
import { KeyIcon, OpenAIIcon, ClaudeIcon, CheckCircleIcon, ExclamationCircleIcon, LogoIcon } from '../Icons';

const providerIcons: { [key in ApiProvider]: React.FC<{ className?: string }> } = {
    'Gemini': LogoIcon,
    'OpenAI': OpenAIIcon,
    'Claude': ClaudeIcon,
    'OpenRouter': KeyIcon,
    'X': KeyIcon
};

const ApiKeyRow: React.FC<{
    apiKeyEntry: ApiKeyEntry;
    onKeyChange: (id: string, newKey: string) => void;
}> = ({ apiKeyEntry, onKeyChange }) => {
    const [showKey, setShowKey] = useState(false);
    const ProviderIcon = providerIcons[apiKeyEntry.provider] || KeyIcon;
    const isGemini = apiKeyEntry.provider === 'Gemini';

    return (
        <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-slate-800 last:border-b-0 gap-4">
            <div className="flex items-center gap-4 w-full md:w-1/4">
                <ProviderIcon className={`w-8 h-8 ${apiKeyEntry.provider === 'Claude' ? 'text-black' : 'text-slate-300'}`} />
                <h4 className="font-bold text-white text-lg">{apiKeyEntry.provider}</h4>
            </div>
            <div className="w-full md:w-1/2 flex items-center gap-2">
                <input
                    type={showKey || isGemini ? 'text' : 'password'}
                    value={apiKeyEntry.apiKey}
                    onChange={(e) => onKeyChange(apiKeyEntry.id, e.target.value)}
                    disabled={isGemini}
                    placeholder={`Enter your ${apiKeyEntry.provider} API Key`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-slate-800/50 disabled:cursor-not-allowed"
                />
                {!isGemini && (
                    <Button variant="ghost" onClick={() => setShowKey(!showKey)}>
                        {showKey ? 'Hide' : 'Show'}
                    </Button>
                )}
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {apiKeyEntry.status === 'Connected' ? (
                    <>
                        <CheckCircleIcon className="w-5 h-5 text-green-400" />
                        <span className="font-semibold text-green-400">Connected</span>
                    </>
                ) : (
                    <>
                        <ExclamationCircleIcon className="w-5 h-5 text-slate-500" />
                        <span className="font-semibold text-slate-500">Disconnected</span>
                    </>
                )}
            </div>
        </div>
    );
};

const ApiKeysView: React.FC<{
    project: Project;
    addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void;
    onUpdateApiKeys: (updatedApiKeys: ApiKeyEntry[]) => void;
}> = ({ project, addLog, onUpdateApiKeys }) => {
    const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>(project.apiKeys);

    useEffect(() => {
        setApiKeys(project.apiKeys);
    }, [project.apiKeys]);

    const handleKeyChange = (id: string, newKey: string) => {
        setApiKeys(currentKeys =>
            currentKeys.map(key => {
                if (key.id === id) {
                    const newStatus = newKey.trim() !== '' ? 'Connected' : 'Disconnected';
                    return { ...key, apiKey: newKey, status: newStatus };
                }
                return key;
            })
        );
    };

    const handleSaveChanges = () => {
        onUpdateApiKeys(apiKeys);
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <section>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">API Keys</h2>
                        <p className="text-slate-400 mt-1">Manage API keys for various AI providers to unlock more models for your agents.</p>
                    </div>
                    <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
                </div>
                <Card className="!p-0">
                    {apiKeys.map(apiKeyEntry => (
                        <ApiKeyRow key={apiKeyEntry.id} apiKeyEntry={apiKeyEntry} onKeyChange={handleKeyChange} />
                    ))}
                </Card>
                <Card className="mt-8">
                    <h3 className="text-lg font-bold text-white">About API Keys</h3>
                    <p className="text-slate-400 mt-2 text-sm">
                        API keys are stored securely within your project's configuration. The Gemini API key is provided by the environment and is not editable here. For other providers, enter your key and click "Save Changes". The status will update to "Connected" if a key is present.
                    </p>
                </Card>
            </section>
        </div>
    );
};

export default ApiKeysView;
