import React, { useState, useEffect } from 'react';
import { Project, AssistantSettings, ActivityLogEntry, ApiProvider } from '../../types';
import { Card, Button, ToggleSwitch } from '../UI';
import { AVAILABLE_MODELS, DEFAULT_ASSISTANT_SETTINGS } from '../../constants';

const AssistantSettingsView: React.FC<{ 
    project: Project; 
    addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void; 
    onUpdateSettings: (settings: AssistantSettings) => void;
}> = ({ project, addLog, onUpdateSettings }) => {
    const [settings, setSettings] = useState<AssistantSettings>(project.assistantSettings);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    useEffect(() => {
        setSettings(project.assistantSettings);
    }, [project.assistantSettings]);

    useEffect(() => {
        const models = AVAILABLE_MODELS[settings.provider] || [];
        setAvailableModels(models);
        // If current model is not in the list for the new provider, select the first one
        if (!models.includes(settings.model)) {
            setSettings(s => ({ ...s, model: models[0] || '' }));
        }
    }, [settings.provider, settings.model]);

    const handleProviderChange = (provider: ApiProvider) => {
        const models = AVAILABLE_MODELS[provider] || [];
        setSettings(s => ({
            ...s,
            provider,
            model: models[0] || ''
        }));
    };

    const handleSaveChanges = () => {
        onUpdateSettings(settings);
    };
    
    const handleResetToDefaults = () => {
        setSettings(DEFAULT_ASSISTANT_SETTINGS);
        addLog("Assistant settings reset to defaults. Save to apply.", "warning");
    }

    const getApiKeyStatus = (provider: ApiProvider): 'Connected' | 'Disconnected' => {
        const keyEntry = project.apiKeys.find(k => k.provider === provider);
        return keyEntry ? keyEntry.status : 'Disconnected';
    }

    return (
        <div className="animate-fade-in-up space-y-8 max-w-4xl mx-auto">
            <section>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Assistant Settings</h2>
                        <p className="text-slate-400 mt-1">Configure the behavior, voice, and intelligence of your AI assistant.</p>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="secondary" onClick={handleResetToDefaults}>Reset</Button>
                         <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
                    </div>
                </div>
            </section>
            
            <Card>
                 <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div>
                        <h4 className="font-bold text-white">Enable Assistant</h4>
                        <p className="text-sm text-slate-400">Master toggle for the AI assistant.</p>
                    </div>
                    <ToggleSwitch 
                        enabled={settings.enabled} 
                        onChange={(val) => setSettings(s => ({...s, enabled: val}))} 
                    />
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Intelligence Core</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
                        <select 
                            value={settings.provider}
                            onChange={(e) => handleProviderChange(e.target.value as ApiProvider)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            {Object.keys(AVAILABLE_MODELS).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {getApiKeyStatus(settings.provider) === 'Disconnected' && (
                             <p className="text-xs text-yellow-400 mt-2">API key for {settings.provider} is not connected. The assistant may not function.</p>
                        )}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                        <select
                            value={settings.model}
                            onChange={(e) => setSettings(s => ({ ...s, model: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            disabled={availableModels.length === 0}
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map(m => <option key={m} value={m}>{m}</option>)
                            ) : (
                                <option>No models available for this provider</option>
                            )}
                        </select>
                    </div>
                </div>
            </Card>

             <Card>
                <h3 className="text-xl font-bold text-white mb-4">Voice & Language</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Recognition Language</label>
                         <select
                            value={settings.language}
                            onChange={(e) => setSettings(s => ({ ...s, language: e.target.value as AssistantSettings['language'] }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="de-DE">Deutsch (Deutschland)</option>
                            <option value="en-US">English (United States)</option>
                            <option value="es-ES">Español (España)</option>
                            <option value="fr-FR">Français (France)</option>
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-bold text-white mb-4">Personality & Behavior</h3>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">System Instruction (Persona)</label>
                        <textarea 
                            value={settings.systemInstruction}
                            onChange={(e) => setSettings(s => ({...s, systemInstruction: e.target.value}))}
                            rows={12}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AssistantSettingsView;