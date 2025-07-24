



import React, { useState, useMemo, useEffect } from 'react';
import { Project, DAAgent, DAAgentStatus, ActivityLogEntry, ALL_AGENT_TYPES, AgentType, ConsensusTopic, ApiKeyEntry, HoDQueryContext } from '../../types';
import { Card, Button, Modal } from '../UI';
import { AgentIcon, PlusIcon, DAAIcon, PaperAirplaneIcon, SearchIcon, HeadOfDevIcon } from '../Icons';
import { AVAILABLE_MODELS } from '../../constants';


const DAAgentStatusIndicator: React.FC<{ status: DAAgentStatus }> = ({ status }) => {
  const statusConfig = {
    'Active': { color: 'bg-green-500', text: 'Active' },
    'Idle': { color: 'bg-slate-500', text: 'Idle' },
    'Scaling': { color: 'bg-cyan-500 animate-pulse', text: 'Scaling' },
    'Terminated': { color: 'bg-red-500', text: 'Terminated' },
  };
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
      <span className="text-sm font-medium text-slate-300">{config.text}</span>
    </div>
  );
};

const CapabilityMatcherModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onMatch: (capabilities: string[]) => void;
}> = ({ isOpen, onClose, onMatch }) => {
    const [caps, setCaps] = useState('');
    const handleMatch = () => {
        onMatch(caps.split(',').map(c => c.trim()).filter(Boolean));
        onClose();
        setCaps('');
    };

    return (
         <Modal isOpen={isOpen} onClose={onClose} title="Match Agent to Task">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Required Capabilities (comma-separated)</label>
                    <input type="text" value={caps} onChange={e => setCaps(e.target.value)} placeholder="e.g., react, security-analysis" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleMatch}><SearchIcon className="w-5 h-5"/> Find Match</Button>
                </div>
            </div>
        </Modal>
    )
}

const CreateAgentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (agent: Omit<DAAgent, 'id'>) => void;
    apiKeys: ApiKeyEntry[];
}> = ({ isOpen, onClose, onCreate, apiKeys }) => {
    const [type, setType] = useState<AgentType>('Coder');
    
    const availableModels = useMemo(() => {
        return apiKeys
            .filter(key => key.status === 'Connected')
            .flatMap(key =>
                (AVAILABLE_MODELS[key.provider] || []).map(modelName => `${key.provider}/${modelName}`)
            );
    }, [apiKeys]);
    
    const [model, setModel] = useState(availableModels[0] || '');
    const [capabilities, setCapabilities] = useState('');
    const [memory, setMemory] = useState(1024);
    const [compute, setCompute] = useState<'low' | 'medium' | 'high'>('medium');

    useEffect(() => {
        if (!model && availableModels.length > 0) {
            setModel(availableModels[0]);
        }
    }, [availableModels, model]);

    const handleCreate = () => {
        onCreate({
            type,
            model,
            status: 'Idle',
            resources: { memory, compute },
            capabilities: capabilities.split(',').map(c => c.trim()).filter(Boolean)
        });
        onClose();
        // Reset form
        setType('Coder');
        setCapabilities('');
        setMemory(1024);
        setCompute('medium');
        setModel(availableModels[0] || '');
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Specialized Agent">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Agent Type</label>
                    <select value={type} onChange={e => setType(e.target.value as AgentType)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                        {ALL_AGENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                    <select value={model} onChange={e => setModel(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" disabled={availableModels.length === 0}>
                        {availableModels.length > 0 ? (
                            availableModels.map(m => <option key={m} value={m}>{m}</option>)
                        ) : (
                            <option>No connected providers found</option>
                        )}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Capabilities (comma-separated)</label>
                    <input type="text" value={capabilities} onChange={e => setCapabilities(e.target.value)} placeholder="e.g., react, tailwind, security-analysis" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Resources</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-medium text-slate-400 mb-1">Memory (MB)</label>
                            <input type="number" value={memory} onChange={e => setMemory(parseInt(e.target.value, 10))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Compute</label>
                             <select value={compute} onChange={e => setCompute(e.target.value as any)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!model} className="bg-gradient-to-br from-fuchsia-600 to-indigo-600">Create Agent</Button>
                </div>
            </div>
        </Modal>
    )
}

const SendMessageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSend: (fromId: string, toId: string, message: string) => void;
    agents: DAAgent[];
    fromAgent: DAAgent | null;
}> = ({ isOpen, onClose, onSend, agents, fromAgent }) => {
    const [toId, setToId] = useState('');
    const [message, setMessage] = useState('');

    if (!fromAgent) return null;

    const availableAgents = agents.filter(a => a.id !== fromAgent.id && a.status !== 'Terminated');

    const handleSend = () => {
        if (!toId || !message) return;
        onSend(fromAgent.id, toId, message);
        onClose();
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Send Message from ${fromAgent.type} Agent`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">To Agent</label>
                     <select value={toId} onChange={e => setToId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500">
                        <option value="">Select recipient...</option>
                        {availableAgents.map(a => <option key={a.id} value={a.id}>{a.type} ({a.id.slice(-6)})</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Type your message..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSend}><PaperAirplaneIcon className="w-5 h-5" /> Send</Button>
                </div>
            </div>
        </Modal>
    );
}

const ConsensusModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onStart: (topic: string) => void;
}> = ({ isOpen, onClose, onStart }) => {
    const [topic, setTopic] = useState('');
    const handleStart = () => {
        if (!topic) return;
        onStart(topic);
        onClose();
        setTopic('');
    }
    return (
         <Modal isOpen={isOpen} onClose={onClose} title="Start New Consensus Topic">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Topic / Question</label>
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Approve deployment to production?" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleStart}>Start Consensus</Button>
                </div>
            </div>
        </Modal>
    );
}


const DAAgentCard: React.FC<{ 
    agent: DAAgent; 
    onAction: (agentId: string, action: string) => void; 
    onMessage: (agent: DAAgent) => void; 
    isHighlighted: boolean;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ agent, onAction, onMessage, isHighlighted, onQueryHoD }) => {
    return (
        <Card className={isHighlighted ? 'border-cyan-400 shadow-cyan' : ''}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AgentIcon agent={agent.type} className="text-2xl" />
                        {agent.type} Agent
                    </h3>
                    <p className="text-xs font-mono text-slate-500">{agent.id}</p>
                </div>
                <div className="flex items-center gap-2">
                    <DAAgentStatusIndicator status={agent.status} />
                     <button
                        onClick={() => onQueryHoD({ type: 'Agent', id: agent.id, name: `${agent.type} Agent (${agent.id.slice(-6)})` })}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400 transition-colors"
                        title="Query HoD about this agent"
                    >
                        <HeadOfDevIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
                 <div className="flex justify-between"><span className="text-slate-400">Model</span> <span className="font-mono text-white capitalize">{agent.model}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Compute</span> <span className="font-mono text-white capitalize">{agent.resources.compute}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Memory</span> <span className="font-mono text-white">{agent.resources.memory} MB</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Assigned Hive</span> <span className="font-mono text-fuchsia-400">{agent.hiveId ? agent.hiveId.slice(0, 15) : 'None'}</span></div>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-4">
                 <p className="text-sm text-slate-400 mb-2">Capabilities:</p>
                 <div className="flex flex-wrap gap-2">
                    {agent.capabilities.length > 0 ? agent.capabilities.map(cap => (
                        <span key={cap} className="text-xs bg-slate-700 px-2 py-1 rounded-full">{cap}</span>
                    )) : <span className="text-xs text-slate-500">No specific capabilities defined.</span>}
                 </div>
            </div>
             <div className="mt-4 border-t border-slate-700 pt-4 flex gap-2 flex-wrap">
                <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => onAction(agent.id, 'Scale Up')}>Scale Up</Button>
                <Button variant="secondary" className="text-xs py-1 px-2" onClick={() => onMessage(agent)}>Message</Button>
                <Button variant="secondary" className="text-red-400 border-red-500/50 hover:bg-red-500/20 text-xs py-1 px-2 ml-auto" onClick={() => onAction(agent.id, 'Terminate')}>Terminate</Button>
            </div>
        </Card>
    )
}

const ConsensusCard: React.FC<{ 
    topics: ConsensusTopic[]; 
    agents: DAAgent[];
    onStartConsensus: () => void; 
}> = ({ topics, agents, onStartConsensus }) => {
    const getAgent = (agentId: string) => agents.find(a => a.id === agentId);
    const voteIcons: Record<string, string> = { 'yes': '👍', 'no': '👎', 'abstain': '🤔' };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">DAA Consensus</h3>
                <Button variant="primary" onClick={onStartConsensus}>Start Topic</Button>
            </div>
            {topics.length > 0 ? (
                <div className="space-y-4">
                {topics.map(topic => (
                    <div key={topic.id} className="bg-slate-800/50 p-4 rounded-lg">
                        <p className="font-bold text-slate-300">{topic.topic}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm font-medium text-slate-400">Votes:</span>
                            <div className="flex items-center gap-3">
                                {topic.participants.map(p => {
                                    const agent = getAgent(p.agentId);
                                    return agent ? (
                                        <div key={p.agentId} title={`${agent.type} voted ${p.vote}`} className="flex items-center gap-1 text-2xl bg-slate-700/50 px-2 py-1 rounded-lg">
                                            <span><AgentIcon agent={agent.type} /></span>
                                            <span className="text-sm">{voteIcons[p.vote]}</span>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            ) : <p className="text-slate-500 text-center py-4">No active consensus topics.</p>}
        </Card>
    )
}

const DAAView: React.FC<{ 
    project: Project; 
    addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void; 
    onCreateAgent: (agent: Omit<DAAgent, 'id'>) => void;
    onStartConsensus: (topic: string) => void;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ project, addLog, onCreateAgent, onStartConsensus, onQueryHoD }) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isConsensusModalOpen, setIsConsensusModalOpen] = useState(false);
    const [isMatcherModalOpen, setIsMatcherModalOpen] = useState(false);
    const [messagingAgent, setMessagingAgent] = useState<DAAgent | null>(null);
    const [matchingAgentIds, setMatchingAgentIds] = useState<string[]>([]);
    
    const handleAgentAction = (agentId: string, action: string) => {
        const agent = project.daaAgents.find(a => a.id === agentId);
        addLog(`Executing DAA action: "${action}" on ${agent?.type} agent (${agentId.slice(-6)})`, 'info');
        setTimeout(() => {
             addLog(`DAA action "${action}" completed for agent ${agent?.type}.`, 'success');
        }, 1000);
    };

    const handleOpenMessageModal = (agent: DAAgent) => {
        setMessagingAgent(agent);
        setIsMessageModalOpen(true);
    };

    const handleSendMessage = (fromId: string, toId: string, message: string) => {
        const fromAgent = project.daaAgents.find(a => a.id === fromId);
        const toAgent = project.daaAgents.find(a => a.id === toId);
        if (!fromAgent || !toAgent) return;
        addLog(`Message from ${fromAgent.type} to ${toAgent.type}: "${message}"`, 'info', true);
    };

    const handleMatchCapabilities = (caps: string[]) => {
        if (caps.length === 0) return;
        addLog(`Matching capabilities: ${caps.join(', ')}`, 'info');
        const matchedIds = project.daaAgents.filter(agent => 
            caps.every(cap => agent.capabilities.includes(cap.toLowerCase()))
        ).map(agent => agent.id);

        setMatchingAgentIds(matchedIds);
        addLog(`Found ${matchedIds.length} matching agents.`, 'success', true);

        setTimeout(() => {
            setMatchingAgentIds([]);
        }, 4000); // Highlight for 4 seconds
    };
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Dynamic Agent Architecture (DAA)</h2>
                    <p className="text-slate-400 mt-1">Programmatically control agent lifecycle and coordination.</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                    <Button variant="secondary" onClick={() => setIsMatcherModalOpen(true)}>
                        <SearchIcon className="w-5 h-5"/>
                        Match Task
                    </Button>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                        <PlusIcon className="w-5 h-5"/>
                        Create Agent
                    </Button>
                </div>
            </div>
            
            <ConsensusCard agents={project.daaAgents} topics={project.consensusTopics} onStartConsensus={() => setIsConsensusModalOpen(true)} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {project.daaAgents.map(agent => (
                    <DAAgentCard 
                        key={agent.id} 
                        agent={agent} 
                        onAction={handleAgentAction} 
                        onMessage={handleOpenMessageModal}
                        isHighlighted={matchingAgentIds.includes(agent.id)} 
                        onQueryHoD={onQueryHoD}
                    />
                ))}
            </div>

            <CreateAgentModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={onCreateAgent}
                apiKeys={project.apiKeys}
            />
            <SendMessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                onSend={handleSendMessage}
                agents={project.daaAgents}
                fromAgent={messagingAgent}
            />
             <ConsensusModal
                isOpen={isConsensusModalOpen}
                onClose={() => setIsConsensusModalOpen(false)}
                onStart={onStartConsensus}
            />
            <CapabilityMatcherModal 
                isOpen={isMatcherModalOpen}
                onClose={() => setIsMatcherModalOpen(false)}
                onMatch={handleMatchCapabilities}
            />
        </div>
    );
};

export default DAAView;