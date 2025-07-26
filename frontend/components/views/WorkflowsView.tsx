


import React, { useState, useEffect, useRef } from 'react';
import { Project, Workflow, ActivityLogEntry, WorkflowStep, HoDQueryContext } from '../../types';
import { Card, Button, Modal } from '../UI';
import { PlusIcon, TerminalIcon, XIcon, HeadOfDevIcon } from '../Icons';
import FlowEditor, { GraphData } from '../FlowEditor';
import WorkflowQueue from '../WorkflowQueue';

const CreateWorkflowModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (workflow: Omit<Workflow, 'id' | 'lastRun'>) => void;
}> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [steps, setSteps] = useState<Omit<WorkflowStep, 'id'>[]>([{ name: '', command: '' }]);

    const handleStepChange = (index: number, field: 'name' | 'command', value: string) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const addStep = () => {
        setSteps([...steps, { name: '', command: '' }]);
    };

    const removeStep = (index: number) => {
        if (steps.length > 1) {
            setSteps(steps.filter((_, i) => i !== index));
        }
    };

    const handleCreate = () => {
        if (!name || steps.some(s => !s.name || !s.command)) return;
        const finalSteps = steps.map((step, index) => ({ ...step, id: `step-new-${index}` }));
        onCreate({ name, description, steps: finalSteps });
        onClose();
        // Reset state
        setName('');
        setDescription('');
        setSteps([{ name: '', command: '' }]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Workflow">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Workflow Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Daily Data Sync" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Describe what this workflow does" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Steps</label>
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={step.name} onChange={e => handleStepChange(index, 'name', e.target.value)} placeholder="Step Name" className="w-1/3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                <input type="text" value={step.command} onChange={e => handleStepChange(index, 'command', e.target.value)} placeholder="Command" className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                <button onClick={() => removeStep(index)} className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-50" disabled={steps.length <= 1}>
                                    <XIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                     <Button variant="ghost" onClick={addStep} className="mt-3 text-sm text-cyan-400"><PlusIcon className="w-4 h-4" /> Add Step</Button>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate}>Create Workflow</Button>
                </div>
            </div>
        </Modal>
    );
};

const WorkflowCard: React.FC<{
    workflow: Workflow;
    onRun: (workflowId: string) => void;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ workflow, onRun, onQueryHoD }) => {
    return (
        <Card className="flex flex-col">
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white flex-grow">{workflow.name}</h3>
                <button
                    onClick={() => onQueryHoD({ type: 'Workflow', id: workflow.id, name: workflow.name })}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400 transition-colors"
                    title="Query HoD about this workflow"
                >
                    <HeadOfDevIcon className="w-5 h-5"/>
                </button>
            </div>
            <p className="text-slate-400 mt-1 text-sm flex-grow">{workflow.description}</p>
            <div className="my-4 border-t border-b border-slate-700/50 py-3 space-y-2">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Steps:</h4>
                {workflow.steps.map((step: WorkflowStep) => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                        <TerminalIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-300">{step.name}</span>
                        <code className="text-xs text-fuchsia-400 ml-auto bg-slate-800/50 p-1 rounded">
                            {step.command}
                        </code>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-auto">
                <p className="text-xs text-slate-500">
                    Last run: {workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}
                </p>
                <Button variant="primary" onClick={() => onRun(workflow.id)}>Run Workflow</Button>
            </div>
        </Card>
    )
}

const WorkflowsView: React.FC<{
    project: Project;
    addLog: (message: string, type?: ActivityLogEntry['type']) => void;
    onCreateWorkflow: (workflow: Omit<Workflow, 'id' | 'lastRun'>) => void;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ project, addLog, onCreateWorkflow, onQueryHoD }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [graph, setGraph] = useState<GraphData | undefined>();
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [sessions, setSessions] = useState<{id: number; name: string}[]>([]);

    useEffect(() => {
        fetch('/session/list')
            .then(res => res.json())
            .then(data => setSessions(data))
            .catch(() => {});
    }, []);
    const handleSaveGraph = async (g: GraphData) => {
        const res = await fetch('/session/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sessionId, name: 'workflow', data: g })
        });
        const data = await res.json();
        setSessionId(data.id);
        setGraph(g);
        addLog('Session saved', 'success');
    };

    const handleLoadGraph = async () => {
        if (!sessionId) return;
        const res = await fetch('/session/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sessionId })
        });
        if (res.ok) {
            const data = await res.json();
            setGraph(data.data);
            addLog('Session loaded', 'success');
        }
    };

    const handleExportGraph = async () => {
        if (!sessionId) return;
        const res = await fetch(`/session/export/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow-${sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const fileRef = useRef<HTMLInputElement>(null);

    const handleImportGraph = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
            const data: GraphData = JSON.parse(text);
            const res = await fetch('/session/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: file.name, data })
            });
            const saved = await res.json();
            setSessionId(saved.id);
            setGraph(data);
            addLog('Session imported', 'success');
        } catch {
            addLog('Failed to import session', 'error');
        } finally {
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const handleRunWorkflow = (workflowId: string) => {
        const workflow = project.workflows.find(w => w.id === workflowId);
        if (!workflow) return;
        addLog(`Executing workflow: "${workflow.name}"...`, 'info');
        setTimeout(() => {
            addLog(`Workflow "${workflow.name}" completed successfully.`, 'success');
        }, 2000);
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white">Workflow Automation</h2>
                    <p className="text-slate-400 mt-1">Create, manage, and execute automated workflows.</p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <PlusIcon className="w-5 h-5"/>
                    Create Workflow
                </Button>
            </div>

            <WorkflowQueue />
            
            {project.workflows.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {project.workflows.map(workflow => (
                        <WorkflowCard key={workflow.id} workflow={workflow} onRun={handleRunWorkflow} onQueryHoD={onQueryHoD} />
                    ))}
                </div>
            ) : (
                 <Card>
                    <div className="text-center py-12">
                         <h3 className="text-xl font-bold text-white">No Workflows Yet</h3>
                         <p className="text-slate-400 mt-2">Create your first workflow to automate repetitive tasks.</p>
                         <Button variant="primary" className="mt-6" onClick={() => setIsCreateModalOpen(true)}>
                            Create Workflow
                        </Button>
                    </div>
                 </Card>
            )}
            <CreateWorkflowModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={onCreateWorkflow}
            />

            <div className="pt-8">
                <h3 className="text-xl font-bold text-white mb-2">Workflow Graph</h3>
                <FlowEditor onSave={handleSaveGraph} initial={graph} />
                <div className="mt-2 flex gap-2 items-center">
                    <select
                        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1"
                        value={sessionId ?? ''}
                        onChange={e => setSessionId(e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">Select Session</option>
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <Button variant="secondary" onClick={handleLoadGraph} disabled={!sessionId}>Load</Button>
                    <Button variant="secondary" onClick={handleExportGraph} disabled={!sessionId}>Export</Button>
                    <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImportGraph} />
                    <Button variant="secondary" onClick={() => fileRef.current?.click()}>Import</Button>
                </div>
            </div>
        </div>
    );
};

export default WorkflowsView;