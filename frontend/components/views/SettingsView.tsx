
import React, { useState } from 'react';
import { Project, Hook, HookSettings, ActivityLogEntry } from '../../types';
import { Card, Button, ToggleSwitch, Modal } from '../UI';

const hookDescriptions: Record<keyof HookSettings, {name: string, desc: string}> = {
    preTaskHook: { name: 'Pre-Task', desc: 'Auto-assigns agents based on task complexity.' },
    preSearchHook: { name: 'Pre-Search', desc: 'Caches searches for improved performance.' },
    preEditHook: { name: 'Pre-Edit', desc: 'Runs before a file is edited, e.g., for validation or formatting.' },
    preCommandHook: { name: 'Pre-Command', desc: 'Provides security validation before command execution.' },
    postEditHook: { name: 'Post-Edit', desc: 'Auto-formats code using language-specific tools after an edit.' },
    postTaskHook: { name: 'Post-Task', desc: 'Trains neural patterns from successful operations.' },
    postCommandHook: { name: 'Post-Command', desc: 'Updates memory with the context of an operation.' },
    notificationHook: { name: 'Notification', desc: 'Provides real-time progress updates for ongoing operations.' },
    sessionStartHook: { name: 'Session Start', desc: 'Restores previous context automatically when a session starts.' },
    sessionEndHook: { name: 'Session End', desc: 'Triggers when a session ends to generate summaries and persist state.' },
    sessionRestoreHook: { name: 'Session Restore', desc: 'Loads memory and state from previous sessions upon restore.' },
  };

interface HookRowProps {
  hookKey: keyof HookSettings;
  hook: Hook;
  onToggle: (hookKey: keyof HookSettings, enabled: boolean) => void;
}

const HookRow: React.FC<HookRowProps> = ({ hookKey, hook, onToggle }) => {
  const { name, desc } = hookDescriptions[hookKey] || { name: hookKey, desc: 'Custom hook.'};

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-800 last:border-b-0">
      <div>
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-slate-400 max-w-xl">{desc}</p>
        <code className="text-xs text-fuchsia-400 bg-slate-800/50 p-1 rounded mt-1 inline-block">{hook.command} {hook.args.join(' ')}</code>
      </div>
      <ToggleSwitch enabled={hook.enabled} onChange={(enabled) => onToggle(hookKey, enabled)} />
    </div>
  );
};


const SettingsView: React.FC<{ project: Project; addLog: (message: string, type?: ActivityLogEntry['type']) => void; }> = ({ project, addLog }) => {
  const [settings, setSettings] = useState<HookSettings>(project.settings);
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  
  const handleToggle = (hookKey: keyof HookSettings, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      [hookKey]: { ...prev[hookKey], enabled }
    }));
  };

  const handleSaveChanges = () => {
      addLog("Saving hook settings...", 'info');
      // Here you would normally have an API call
      setTimeout(() => {
          addLog("Hook settings saved successfully.", 'success');
      }, 1000);
  };

  const handleFixHooks = () => {
    setIsFixModalOpen(false);
    addLog("Running command: npx claude-flow@alpha fix-hook-variables...", 'info');
     setTimeout(() => {
          addLog("Hook variables fixed successfully.", 'success');
      }, 1500);
  };

  return (
    <div className="animate-fade-in-up space-y-8">
      <section>
        <div className="flex justify-between items-start mb-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Hook Settings</h2>
                <p className="text-slate-400 mt-1">Automate your workflow by enabling or disabling hooks.</p>
            </div>
            <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
        </div>
        <Card className="!p-0">
          {Object.entries(settings).map(([key, hook]) => (
            <HookRow
              key={key}
              hookKey={key as keyof HookSettings}
              hook={hook}
              onToggle={handleToggle}
            />
          ))}
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Advanced</h2>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Fix Hook Variables</h4>
              <p className="text-slate-400 mt-1">Automatically transform legacy variable syntax (e.g., {'${file}'}) to environment variables.</p>
            </div>
            <Button variant="secondary" onClick={() => setIsFixModalOpen(true)}>Run Fix</Button>
          </div>
        </Card>
      </section>

      <Modal isOpen={isFixModalOpen} onClose={() => setIsFixModalOpen(false)} title="Confirm Hook Variable Fix">
          <p className="text-slate-300">This will scan all `settings.json` files and transform legacy variables to the new environment variable format.</p>
          <div className="my-4 space-y-2 font-mono text-sm bg-slate-800 p-4 rounded-lg">
            <p><span className="text-red-400">${'{file}'}</span> <span className="text-slate-400">→</span> <span className="text-green-400">$CLAUDE_EDITED_FILE</span></p>
            <p><span className="text-red-400">${'{command}'}</span> <span className="text-slate-400">→</span> <span className="text-green-400">$CLAUDE_COMMAND</span></p>
            <p><span className="text-red-400">${'{tool}'}</span> <span className="text-slate-400">→</span> <span className="text-green-400">$CLAUDE_TOOL</span></p>
          </div>
          <p className="text-slate-400 mt-2">This action is generally safe and recommended for compatibility with Claude Code 1.0.51+.</p>
          <div className="flex justify-end gap-4 pt-6">
              <Button variant="secondary" onClick={() => setIsFixModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleFixHooks}>Confirm and Run</Button>
          </div>
      </Modal>
    </div>
  );
};

export default SettingsView;
