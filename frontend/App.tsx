

import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PROJECTS, AVAILABLE_MODELS, HEAD_OF_DEVELOPMENT_SYSTEM_PROMPT } from './constants';
import { Project, View, Hive, HiveStatus, AgentType, ActivityLogEntry, ALL_AGENT_TYPES, MemoryEntry, Command, DAAgent, Toast, Workflow, Integration, IntegrationProvider, ConsensusTopic, WorkflowStep, Mission, SubTask, StrikeTeam, RoadmapMission, ApiKeyEntry, AssistantStatus, AssistantAction, AssistantSettings, ChatMessage, HoDQueryContext } from './types';
import ProjectSelector from './components/views/ProjectSelector';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import WorkspaceView from './components/views/WorkspaceView';
import MemoryView from './components/views/MemoryView';
import SettingsView from './components/views/SettingsView';
import NeuralView from './components/views/NeuralView';
import NexusView from './components/views/NexusView';
import MCPToolsView from './components/views/MCPToolsView';
import DAAView from './components/views/DAAView';
import WorkflowsView from './components/views/WorkflowsView';
import SystemView from './components/views/SystemView';
import IntegrationsView from './components/views/IntegrationsView';
import ApiKeysView from './components/views/ApiKeysView';
import AdminView from './components/views/AdminView';
import AssistantSettingsView from './components/views/AssistantSettingsView';
import AIHeadOfDevelopmentView from './components/views/AIHeadOfDevelopmentView';
import CommandPalette from './components/CommandPalette';
import { ToastContainer } from './components/Toast';
import { Modal, Button } from './components/UI';
import { AgentIcon, TerminalIcon, ChevronDownIcon, DashboardIcon, WorkspaceIcon, MemoryIcon, NexusIcon, BrainIcon, ToolsIcon, DAAIcon, WorkflowIcon, PlusIcon, SystemIcon, IntegrationsIcon, KeyIcon, SettingsIcon, HeadOfDevIcon, RoadmapIcon } from './components/Icons';
import InitiateProjectModal from './components/views/InitiateProjectModal';
import Assistant from './components/Assistant';
import HoDQueryModal from './components/HoDQueryModal';
import { GoogleGenAI, Type } from "@google/genai";
import LoginView from './components/views/LoginView';
import RegisterView from './components/views/RegisterView';
import { useAuth } from './hooks/useAuth';

const ActivityLog: React.FC<{ 
    logs: ActivityLogEntry[], 
    onClear: () => void,
    isOpen: boolean,
    onToggle: () => void 
}> = ({ logs, onClear, isOpen, onToggle }) => {
    const logTypeClasses = {
        info: 'text-cyan-400',
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40">
            <div className="w-[calc(100%-256px)] ml-64">
                 <button onClick={onToggle} className="bg-slate-800/80 backdrop-blur-md border-t border-x border-slate-700 px-6 py-2 rounded-t-lg flex items-center gap-2 text-white font-semibold">
                    <TerminalIcon className="w-5 h-5" />
                    Activity Console
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
                </button>
            </div>
            {isOpen && (
                <div className="h-48 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 ml-64 p-4 flex flex-col">
                    <div className="flex justify-end mb-2">
                        <button onClick={onClear} className="text-xs text-slate-400 hover:text-white">Clear</button>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 pr-2">
                        {logs.length > 0 ? logs.map(log => (
                            <div key={log.id} className="flex gap-4">
                                <span className="text-slate-500">{log.timestamp}</span>
                                <span className={logTypeClasses[log.type]}>{log.message}</span>
                            </div>
                        )).slice().reverse() : <p className="text-slate-500">No activity yet. Start a task to see logs.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

const SpawnHiveModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSpawn: (name: string, namespace: string, agents: AgentType[], isTemporary: boolean) => void;
}> = ({ isOpen, onClose, onSpawn }) => {
    const [name, setName] = useState('');
    const [namespace, setNamespace] = useState('');
    const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
    const [isTemporary, setIsTemporary] = useState(false);

    const handleAgentToggle = (agent: AgentType) => {
        setSelectedAgents(prev => 
            prev.includes(agent) ? prev.filter(a => a !== agent) : [...prev, agent]
        );
    };
    
    const handleSpawn = () => {
        if (!name) return;
        onSpawn(name, namespace, selectedAgents, isTemporary);
        onClose();
        setName('');
        setNamespace('');
        setSelectedAgents([]);
        setIsTemporary(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Spawn New Hive-Mind Session">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Task / Goal</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Implement payment gateway" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Namespace (optional)</label>
                    <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="e.g., payments" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Specialized Agents</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {ALL_AGENT_TYPES.map(agent => (
                            <button key={agent} onClick={() => handleAgentToggle(agent)} className={`p-2 border rounded-lg flex flex-col items-center gap-1 transition-all ${selectedAgents.includes(agent) ? 'bg-fuchsia-500/20 border-fuchsia-500' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}>
                                <AgentIcon agent={agent} className="text-2xl" />
                                <span className="text-xs font-semibold">{agent}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="temp-hive" checked={isTemporary} onChange={e => setIsTemporary(e.target.checked)} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-fuchsia-500 focus:ring-fuchsia-500" />
                    <label htmlFor="temp-hive" className="text-sm text-slate-300">Create as temporary hive (for experimenting)</label>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSpawn} className="bg-gradient-to-br from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-magenta hover:shadow-magenta-lg">Spawn Hive</Button>
                </div>
            </div>
        </Modal>
    );
};

const App: React.FC = () => {
  const { token } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!token) {
    return showRegister ? <RegisterView onSwitch={() => setShowRegister(false)} /> : <LoginView onSwitch={() => setShowRegister(true)} />;
  }

  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isSpawnModalOpen, setIsSpawnModalOpen] = useState(false);
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(true);
  
  // States for various AI chats
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [hodStatus, setHodStatus] = useState<AssistantStatus>('idle');
  const [hodChatHistory, setHodChatHistory] = useState<ChatMessage[]>([]);

  // State for contextual HoD queries
  const [isHodQueryModalOpen, setIsHodQueryModalOpen] = useState(false);
  const [hodQueryContext, setHodQueryContext] = useState<HoDQueryContext | null>(null);
  const [hodQueryResponse, setHodQueryResponse] = useState<string>('');
  const [hodQueryStatus, setHodQueryStatus] = useState<'idle' | 'thinking'>('idle');


  const addToast = (message: string, type: Toast['type'] = 'info') => {
      const id = `toast-${Date.now()}`;
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
      }, 5000);
  };
  
  const addLog = (message: string, type: ActivityLogEntry['type'] = 'info', showToast: boolean = false) => {
      setActivityLog(prev => [{
          id: Date.now() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          type,
          message
      }, ...prev]);
      if (showToast) {
          addToast(message, type);
      }
  };
  
  const addChatMessage = (message: Omit<ChatMessage, 'id'>) => {
    setChatHistory(prev => [...prev, { ...message, id: `chat-${Date.now()}` }]);
  };
  
  const addHodChatMessage = (message: Omit<ChatMessage, 'id'>) => {
    setHodChatHistory(prev => [{ ...message, id: `hod-chat-${Date.now()}` }]);
  };


  useEffect(() => {
    if (activeProject) {
        setChatHistory([{
            id: 'init-message',
            role: 'assistant',
            content: `Hi! I'm your AI assistant for the "${activeProject.name}" project. How can I help you today?`,
            suggestions: [
                { text: "Go to Nexus", command: "Navigate to the nexus roadmap view" },
                { text: "Create new Hive", command: "Spawn a new hive" },
            ]
        }]);
         setHodChatHistory([{
            id: 'hod-init-message',
            role: 'assistant',
            content: `Good day, CTO. I am online and ready to receive your directives for the "${activeProject.name}" project. All systems are operational. How shall we proceed?`
        }]);
    } else {
        setChatHistory([]);
        setHodChatHistory([]);
    }
}, [activeProject]);

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId) || null;
    setActiveProject(project);
    setCurrentView('dashboard');
    addLog(`Project "${project?.name}" selected.`);
    addToast(`Switched to project: ${project?.name}`, 'info');
  };

  const handleCreateProject = (name: string, description: string, template: Project['template']) => {
    const newProjectBase: Omit<Project, 'id' | 'name' | 'description' | 'template' | 'assistantSettings'> = {
        hives: [],
        files: [{ id: 'file-init', name: 'src', type: 'directory', children: [] }],
        memory: [],
        settings: MOCK_PROJECTS[0].settings,
        roadmap: [],
        daaAgents: [],
        workflows: [],
        systemServices: MOCK_PROJECTS[0].systemServices,
        integrations: [],
        apiKeys: MOCK_PROJECTS[0].apiKeys,
        consensusTopics: [],
    };

    let newProject: Project = {
        ...newProjectBase,
        id: `proj-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        description,
        template,
        assistantSettings: MOCK_PROJECTS[0].assistantSettings,
    };
    
    if (template === 'Web App') {
        newProject.hives.push({ id: 'hive-frontend', name: 'Frontend Development', namespace: 'frontend', status: HiveStatus.Active, agents: ['Coder', 'Architect'], lastActivity: 'Just now' });
        newProject.daaAgents.push({ id: 'daa-coder-init', type: 'Coder', status: 'Active', hiveId: 'hive-frontend', model: 'Gemini/gemini-2.5-flash', resources: { memory: 1024, compute: 'medium'}, capabilities: ['react', 'css'] });
        newProject.daaAgents.push({ id: 'daa-arch-init', type: 'Architect', status: 'Active', hiveId: 'hive-frontend', model: 'Gemini/gemini-2.5-flash', resources: { memory: 2048, compute: 'high'}, capabilities: ['frontend-architecture'] });
    } else if (template === 'Data Analysis') {
        newProject.hives.push({ id: 'hive-etl', name: 'ETL Pipeline', namespace: 'etl', status: HiveStatus.Idle, agents: ['Analyst', 'Researcher'], lastActivity: 'Just now' });
        newProject.daaAgents.push({ id: 'daa-analyst-init', type: 'Analyst', status: 'Idle', model: 'Gemini/gemini-2.5-flash', resources: { memory: 2048, compute: 'medium'}, capabilities: ['pandas', 'sql'] });
    }

    setProjects(prev => [...prev, newProject]);
    setActiveProject(newProject);
    setCurrentView('dashboard');
    addLog(`New project "${name}" created from '${template}' template.`, 'success', true);
  };

  const handleInitiateAutonomousProject = (
    name: string,
    description: string,
    roadmap: RoadmapMission[],
    team: StrikeTeam
  ) => {
    const newMissions: Mission[] = roadmap.map((m, i) => ({
      id: `mission-gen-${i}`,
      title: m.title,
      description: m.description,
      stage: 'Backlog',
      priority: 'Medium',
      risk: i < 2 ? 'Medium' : 'Low',
      assignedAgentIds: [],
      subTasks: []
    }));

    let newHives: Hive[] = [];
    let newAgents: DAAgent[] = [];

    const teamConfigs: Record<StrikeTeam, { queens: number; hives: number; agents: number; }> = {
      scout: { queens: 1, hives: 2, agents: 4 },
      assault: { queens: 2, hives: 4, agents: 8 },
      juggernaut: { queens: 4, hives: 8, agents: 16 }
    };
    
    const config = teamConfigs[team];
    const agentTypes: AgentType[] = ['Architect', 'Coder', 'Tester', 'Security', 'DevOps', 'Analyst', 'Researcher'];
    const availableModels = activeProject?.apiKeys
        .filter(k => k.status === 'Connected')
        .flatMap(k => AVAILABLE_MODELS[k.provider].map(m => `${k.provider}/${m}`)) || ['Gemini/gemini-2.5-flash'];


    for(let i=0; i<config.queens; i++) {
        const queenId = `daa-queen-${i}`;
        const hiveId = `hive-core-${i}`;
        newAgents.push({ id: queenId, type: 'Queen', status: 'Active', hiveId, model: availableModels[0], resources: { memory: 4096, compute: 'high' }, capabilities: ['project-management']});
        newHives.push({ id: hiveId, name: `Core Swarm ${i+1}`, namespace: `core-${i}`, status: HiveStatus.Active, agents: ['Queen'], lastActivity: 'Just now' });
    }
    
    for(let i=0; i<config.agents; i++) {
        const agentType = agentTypes[i % agentTypes.length];
        newAgents.push({ id: `daa-spec-${i}`, type: agentType, status: 'Idle', model: availableModels[i % availableModels.length], resources: { memory: 1024, compute: 'medium'}, capabilities: [] });
    }


    const newProject: Project = {
      id: `proj-auto-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      description,
      template: 'Autonomous',
      hives: newHives,
      daaAgents: newAgents,
      roadmap: newMissions,
      files: [{ id: 'file-init', name: 'src', type: 'directory', children: [] }],
      memory: [],
      settings: MOCK_PROJECTS[0].settings,
      assistantSettings: MOCK_PROJECTS[0].assistantSettings,
      workflows: [],
      systemServices: MOCK_PROJECTS[0].systemServices,
      integrations: [],
      apiKeys: MOCK_PROJECTS[0].apiKeys,
      consensusTopics: [],
    };

    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    setCurrentView('ai-head-of-dev'); // Go to the new HoD view
    addLog(`New autonomous project "${name}" launched with ${team.toUpperCase()} strike team.`, 'success', true);
  };
  
  const handleExitProject = () => {
    addLog(`Exited project "${activeProject?.name}".`);
    addToast(`Exited project: ${activeProject?.name}`, 'info');
    setActiveProject(null);
  };
  
  const handleSpawnHive = (name: string, namespace: string, agents: AgentType[], isTemporary: boolean) => {
    if (!activeProject) return;
     const availableModels = activeProject.apiKeys
        .filter(k => k.status === 'Connected')
        .flatMap(k => AVAILABLE_MODELS[k.provider].map(m => `${k.provider}/${m}`)) || ['Gemini/gemini-2.5-flash'];

    const newHive: Hive = {
        id: `session-${Math.random().toString(36).substring(2, 9)}`,
        name,
        namespace: namespace || 'default',
        status: HiveStatus.Active,
        agents: agents.length > 0 ? agents : ['Queen', 'Coder'],
        lastActivity: 'Just now',
    };
    
    const newAgents: DAAgent[] = agents.map((agentType, i) => ({
        id: `daa-${Math.random().toString(36).substring(2,9)}`,
        type: agentType,
        status: 'Active',
        hiveId: newHive.id,
        model: availableModels[i % availableModels.length],
        resources: { memory: 1024, compute: 'medium' },
        capabilities: []
    }));
    
    const updatedProject = { 
        ...activeProject, 
        hives: [newHive, ...activeProject.hives],
        daaAgents: [...activeProject.daaAgents, ...newAgents]
    };

    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    addLog(`Spawning new ${isTemporary ? 'temporary ' : ''}hive "${name}" with ${newHive.agents.length} agents.`, 'success', true);
  };

  const handleCreateAgent = (agent: Omit<DAAgent, 'id'>) => {
      if (!activeProject) return;
      const newAgent: DAAgent = {
          ...agent,
          id: `daa-manual-${Math.random().toString(36).substring(2, 9)}`,
      };
      const updatedProject = {
          ...activeProject,
          daaAgents: [newAgent, ...activeProject.daaAgents],
      };
      setActiveProject(updatedProject);
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      addLog(`Created new specialized ${agent.type} agent using ${agent.model}.`, 'success', true);
  };

  const handleStartConsensus = (topic: string) => {
    if (!activeProject) return;
    const newTopic: ConsensusTopic = {
        id: `con-${Date.now()}`,
        topic,
        status: 'active',
        participants: [],
    };
    const updatedProject = {
        ...activeProject,
        consensusTopics: [newTopic, ...activeProject.consensusTopics],
    };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    addLog(`DAA consensus started on topic: "${topic}"`, 'info', true);
  };
  
  const handleRunSwarm = (task: string, continueSessionId?: string) => {
    if (!activeProject) return;
    addLog(`Executing swarm task: "${task}"...`, 'info', true);
    setTimeout(() => {
        let updateMessage = `Swarm task "${task}" completed successfully.`;
        if (continueSessionId) {
             const hive = activeProject.hives.find(h => h.id === continueSessionId);
             if(hive) {
                 handleUpdateHive(hive.id, { status: HiveStatus.Active, lastActivity: 'Just now' });
                 updateMessage += ` Session "${hive.name}" was updated.`
             }
        }
        addLog(updateMessage, 'success', true);
    }, 2000);
  };

  const handleStoreMemory = (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => {
     if (!activeProject) return;
     const newEntry: MemoryEntry = {
         ...entry,
         id: `mem-${Date.now()}`,
         timestamp: new Date().toISOString()
     };
     const updatedProject = { ...activeProject, memory: [newEntry, ...activeProject.memory] };
     setActiveProject(updatedProject);
     setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
     addLog(`Stored new memory in namespace "${entry.namespace}"`, 'success', true);
  };
  
  const handleUpdateHive = (hiveId: string, updates: Partial<Hive>) => {
      if (!activeProject) return;
      let hiveName = '';
      let logMessage = '';

      const updatedHives = activeProject.hives.map(hive => {
          if (hive.id === hiveId) {
              hiveName = updates.name || hive.name;
              if (updates.name && updates.name !== hive.name) {
                  logMessage = `Renamed hive "${hive.name}" to "${updates.name}".`;
              }
              return { ...hive, ...updates };
          }
          return hive;
      });
      const updatedProject = { ...activeProject, hives: updatedHives };
      setActiveProject(updatedProject);
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
      
      if (logMessage) {
        addLog(logMessage, 'info', true);
      } else if(updates.status === HiveStatus.Active) {
        addLog(`Resuming hive session "${hiveName}".`, 'info', true);
      } else if(updates.status === HiveStatus.Paused) {
        addLog(`Pausing hive session "${hiveName}".`, 'warning', true);
      } else if(updates.status === HiveStatus.Idle && 'status' in updates) {
        addLog(`Hive session "${hiveName}" is now idle.`, 'info');
      }
  };

  const handleDestroyHive = (hiveId: string) => {
    if(!activeProject) return;
    const hive = activeProject.hives.find(h => h.id === hiveId);
    if (!hive) return;

    const updatedProject = {
        ...activeProject,
        hives: activeProject.hives.filter(h => h.id !== hiveId),
        daaAgents: activeProject.daaAgents.map((a): DAAgent => {
            if (a.hiveId === hiveId) {
                return { ...a, status: 'Idle', hiveId: undefined };
            }
            return a;
        })
    };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    addLog(`Destroyed hive session "${hive.name}". Associated agents are now idle.`, 'error', true);
  };

  const handleUpdateIntegration = (integrationId: string, newStatus: 'Connected' | 'Disconnected') => {
    if (!activeProject) return;
    
    let providerName: IntegrationProvider | '' = '';
    const updatedIntegrations = activeProject.integrations.map(int => {
        if (int.id === integrationId) {
            providerName = int.provider;
            return { ...int, status: newStatus };
        }
        return int;
    });

    const updatedProject = { ...activeProject, integrations: updatedIntegrations };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));

    if (providerName) {
        const message = `${newStatus === 'Connected' ? 'Connected to' : 'Disconnected from'} ${providerName}.`;
        addLog(message, newStatus === 'Connected' ? 'success' : 'warning', true);
    }
  };
  
    const handleUpdateApiKeys = (updatedApiKeys: ApiKeyEntry[]) => {
        if (!activeProject) return;
        const updatedProject = { ...activeProject, apiKeys: updatedApiKeys };
        setActiveProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        addLog('API Key settings updated.', 'success', true);
    };

    const handleUpdateAssistantSettings = (newSettings: AssistantSettings) => {
        if (!activeProject) return;
        const updatedProject = { ...activeProject, assistantSettings: newSettings };
        setActiveProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        addLog('Assistant settings updated.', 'success', true);
    };

  const handleCreateWorkflow = (workflowData: Omit<Workflow, 'id' | 'lastRun'>) => {
    if (!activeProject) return;

    const newWorkflow: Workflow = {
        ...workflowData,
        id: `wf-user-${Date.now()}`,
        lastRun: null,
    };

    const updatedProject = {
        ...activeProject,
        workflows: [newWorkflow, ...activeProject.workflows],
    };

    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    addLog(`Created new workflow: "${newWorkflow.name}"`, 'success', true);
  };

  const handleUpdateMission = (missionId: string, updates: Partial<Mission>) => {
    if (!activeProject) return;
    
    let missionTitle = '';
    const updatedRoadmap = activeProject.roadmap.map(mission => {
        if (mission.id === missionId) {
            missionTitle = updates.title || mission.title;
            return { ...mission, ...updates };
        }
        return mission;
    });

    const updatedProject = { ...activeProject, roadmap: updatedRoadmap };
    setActiveProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));

    if (updates.stage) {
        addLog(`Mission "${missionTitle}" moved to ${updates.stage} stage.`, 'info', true);
    }
  };

  const handleMissionAction = (missionId: string, action: string) => {
    if (!activeProject) return;
    const mission = activeProject.roadmap.find(m => m.id === missionId);
    if (!mission) return;

    addLog(`Executing action "${action}" on mission "${mission.title}"`, 'info', true);
    
    setTimeout(() => {
        addLog(`Action "${action}" on mission "${mission.title}" completed.`, 'success');
    }, 2000);
  };

  const handleQueenCommand = (command: string) => {
    if (!activeProject) return;
    addLog(`Queen is processing command: "${command}"`, 'info', true);
    
    setTimeout(() => {
        const newSubTask: SubTask = { id: `sub-q-${Date.now()}`, description: 'Flesh out specification for this mission', status: 'pending', agent: 'Architect' };
        
        const newMission: Mission = {
            id: `mission-queen-${Date.now()}`,
            title: command,
            description: `A new objective defined by the Queen based on user input.`,
            stage: 'Backlog',
            priority: 'Medium',
            risk: 'Medium',
            assignedAgentIds: [],
            subTasks: [newSubTask],
        };
        
        const updatedRoadmap = [newMission, ...activeProject.roadmap];
        const updatedProject = { ...activeProject, roadmap: updatedRoadmap };
        setActiveProject(updatedProject);
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));

        addLog(`Queen has added a new mission to the Backlog: "${command}"`, 'success', true);
    }, 2500);
  };
  
   const handleAssistantAction = (action: AssistantAction) => {
        setAssistantStatus('speaking');
        addChatMessage({ role: 'assistant', content: action.feedback, suggestions: action.suggestions });
        addLog(`Assistant: ${action.feedback}`, 'info');

        switch (action.action) {
            case 'CREATE_MISSION_WITH_TEAM':
                const { featureName, teamSize } = action.parameters;
                if (featureName && teamSize && activeProject) {
                    const missionId = `mission-assistant-${Date.now()}`;
                    const newMission: Mission = {
                        id: missionId,
                        title: `Implement ${featureName}`,
                        description: `AI-generated mission for ${featureName}`,
                        stage: 'Specification',
                        priority: 'Medium',
                        risk: 'Medium',
                        assignedAgentIds: [],
                        subTasks: [{ id: 'sub-assist-1', description: 'Define technical specs', status: 'pending', agent: 'Architect' }]
                    };

                    const teamAgentCounts = { small: 2, medium: 4, large: 8 };
                    const agentCount = teamAgentCounts[teamSize] || 4;
                    const agentTypes: AgentType[] = ['Architect', 'Coder', 'Tester', 'Security', 'DevOps', 'Analyst'];
                    const availableModels = activeProject.apiKeys.filter(k => k.status === 'Connected').flatMap(k => AVAILABLE_MODELS[k.provider].map(m => `${k.provider}/${m}`)) || ['Gemini/gemini-2.5-flash'];
                    const newAgents: DAAgent[] = [];

                    for (let i = 0; i < agentCount; i++) {
                        const agentType = agentTypes[i % agentTypes.length];
                        const newAgent: DAAgent = {
                            id: `daa-asst-${Date.now() + i}`,
                            type: agentType,
                            status: 'Idle',
                            model: availableModels[i % availableModels.length],
                            resources: { memory: 1024, compute: 'medium' },
                            capabilities: []
                        };
                        newAgents.push(newAgent);
                        newMission.assignedAgentIds.push(newAgent.id);
                    }
                    
                    const updatedProject = {
                        ...activeProject,
                        roadmap: [newMission, ...activeProject.roadmap],
                        daaAgents: [...activeProject.daaAgents, ...newAgents]
                    };
                    setActiveProject(updatedProject);
                    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
                    setCurrentView('nexus-roadmap');
                    addChatMessage({ role: 'system', content: `Created new mission for "${featureName}" and navigated to Nexus view.` });
                }
                break;
            case 'NAVIGATE':
                if (action.parameters.viewName) {
                    setCurrentView(action.parameters.viewName);
                    addChatMessage({ role: 'system', content: `Navigated to ${action.parameters.viewName} view.` });
                }
                break;
            case 'SPAWN_HIVE':
                 if (action.parameters.hiveName) {
                    handleSpawnHive(action.parameters.hiveName, 'assistant-spawned', ['Queen', 'Coder'], true);
                    addChatMessage({ role: 'system', content: `Spawned new hive named "${action.parameters.hiveName}".` });
                 }
                break;
        }

        setTimeout(() => {
            setAssistantStatus('idle');
        }, 1000);
    };

    const handleProcessCommand = async (command: string) => {
        if (!activeProject || !activeProject.assistantSettings.enabled || !command.trim()) {
            addLog("Assistant is disabled or command is empty.", 'warning');
            return;
        }

        if(command.startsWith('!ERROR:')) {
            const errorType = command.split(':')[1];
            let errorMessage = "An unknown error occurred with speech recognition.";
            if(errorType === 'NO_SPEECH_RECOGNITION') errorMessage = "Speech recognition is not supported by this browser.";
            if(errorType === 'MIC_PERMISSION_DENIED') errorMessage = "Microphone access denied. Please allow microphone permissions in your browser settings.";
            addLog(errorMessage, 'error', true);
            addChatMessage({ role: 'system', content: errorMessage });
            setAssistantStatus('idle');
            return;
        }
        
        addChatMessage({ role: 'user', content: command });

        if (!process.env.API_KEY) {
            addLog("Assistant requires API_KEY to function.", "warning", true);
            addChatMessage({ role: 'assistant', content: "I'm not connected to my core intelligence right now because the API key is missing." });
            return;
        }
        
        const { provider, model, systemInstruction } = activeProject.assistantSettings;

        setAssistantStatus('thinking');
        addLog(`Assistant processing: "${command}"`, 'info');

        try {
            if (provider === 'Gemini') {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: model,
                    contents: command,
                    config: {
                        systemInstruction: systemInstruction,
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                            action: { type: Type.STRING, enum: ['CREATE_MISSION_WITH_TEAM', 'NAVIGATE', 'SPAWN_HIVE', 'UNKNOWN']},
                            parameters: { 
                                type: Type.OBJECT,
                                properties: {
                                    featureName: { type: Type.STRING, description: "The name of the feature for the new mission." },
                                    teamSize: { type: Type.STRING, description: "The size of the team for the new mission (small, medium, or large)." },
                                    viewName: { type: Type.STRING, description: "The name of the view to navigate to." },
                                    hiveName: { type: Type.STRING, description: "The name for the new hive." }
                                }
                            },
                            feedback: { type: Type.STRING },
                            suggestions: {
                                type: Type.ARRAY,
                                description: "A list of follow-up suggestions for the user.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING, description: "The display text for the suggestion chip." },
                                        command: { type: Type.STRING, description: "The command to execute when the chip is clicked." }
                                    },
                                    required: ['text', 'command']
                                }
                            }
                        },
                        required: ['action', 'parameters', 'feedback']
                    }
                }
            });

                const actionResponse = JSON.parse(response.text);
                handleAssistantAction(actionResponse);
            } else if (provider === 'OpenRouter') {
                const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
                if (!apiKey) {
                    addLog('OpenRouter API key not set.', 'warning', true);
                    addChatMessage({ role: 'assistant', content: "OpenRouter API key is missing." });
                    return;
                }
                const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemInstruction },
                            { role: 'user', content: command }
                        ],
                        response_format: { type: 'json_object' }
                    })
                });
                const data = await resp.json();
                const actionResponse = JSON.parse(data.choices[0].message.content);
                handleAssistantAction(actionResponse);
            } else {
                addLog(`Assistant provider "${provider}" is not implemented.`, 'warning', true);
                addChatMessage({ role: 'assistant', content: `Provider ${provider} not supported.` });
            }

        } catch (error) {
            console.error('Assistant processing error:', error);
            const errorMessage = "I seem to have run into a problem processing that. Please try again.";
            addLog(`Assistant failed to process command: ${error}`, 'error', true);
            addChatMessage({ role: 'assistant', content: errorMessage });
        } finally {
            setAssistantStatus('idle');
        }
    };
    
    const handleProcessHoDCommand = async (command: string) => {
        if (!activeProject || !activeProject.assistantSettings.enabled || !command.trim()) return;
        
        addHodChatMessage({ role: 'user', content: command });
        
        setHodStatus('thinking');
        addLog(`HoD is analyzing directive: "${command}"`, 'info');

        try {
            const { provider, model } = activeProject.assistantSettings;
            let hodResponse: any = null;
            const projectContext = { ...activeProject, apiKeys: 'REDACTED', settings: 'REDACTED' };
            const prompt = `Here is the current project state in JSON: ${JSON.stringify(projectContext)}. The CTO's directive is: "${command}"`;

            if (provider === 'Gemini') {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        systemInstruction: HEAD_OF_DEVELOPMENT_SYSTEM_PROMPT,
                        responseMimeType: 'application/json',
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                report: { type: Type.STRING, description: "A detailed report in Markdown format, based on the provided project data and the user's directive." },
                                suggestedDirectives: { type: Type.ARRAY, description: "A list of follow-up questions or commands for the CTO.", items: { type: Type.STRING } }
                            },
                            required: ['report']
                        }
                    }
                });
                hodResponse = JSON.parse(response.text);
            } else if (provider === 'OpenRouter') {
                const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
                if (!apiKey) {
                    addHodChatMessage({ role: 'assistant', content: 'OpenRouter API key is missing.' });
                    return;
                }
                const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: HEAD_OF_DEVELOPMENT_SYSTEM_PROMPT },
                            { role: 'user', content: prompt }
                        ],
                        response_format: { type: 'json_object' }
                    })
                });
                const data = await resp.json();
                hodResponse = JSON.parse(data.choices[0].message.content);
            } else {
                addLog(`Assistant provider "${provider}" is not implemented. Please select Gemini in settings.`, 'warning', true);
                addHodChatMessage({ role: 'assistant', content: `Provider ${provider} not supported.` });
                return;
            }

            const suggestions = hodResponse.suggestedDirectives?.map((s: string) => ({ text: s, command: s })) || [];
            addHodChatMessage({ role: 'assistant', content: hodResponse.report, suggestions });

        } catch (error) {
            console.error("HoD AI Error:", error);
            const errorMessage = "CTO, I've encountered a processing anomaly. Please rephrase your directive or check the system logs.";
            addLog(`HoD AI failed to process directive: ${error}`, 'error', true);
            addHodChatMessage({ role: 'assistant', content: errorMessage });
        } finally {
            setHodStatus('idle');
        }
    }

    const handleOpenHodQueryModal = (context: HoDQueryContext) => {
        setHodQueryContext(context);
        setHodQueryResponse('');
        setHodQueryStatus('idle');
        setIsHodQueryModalOpen(true);
    };
    
    const handleProcessHodContextualQuery = async (query: string) => {
        if (!activeProject || !hodQueryContext || !query.trim()) return;
    
        setHodQueryStatus('thinking');
        setHodQueryResponse('');

        try {
            const { provider, model } = activeProject.assistantSettings;
            const projectContext = { ...activeProject, apiKeys: "REDACTED", settings: "REDACTED" };

            let itemContext: any = null;
            switch(hodQueryContext.type) {
                case 'Mission':
                    itemContext = activeProject.roadmap.find(i => i.id === hodQueryContext.id);
                    break;
                case 'Hive':
                    itemContext = activeProject.hives.find(i => i.id === hodQueryContext.id);
                    break;
                case 'Agent':
                    itemContext = activeProject.daaAgents.find(i => i.id === hodQueryContext.id);
                    break;
                case 'Workflow':
                    itemContext = activeProject.workflows.find(i => i.id === hodQueryContext.id);
                    break;
            }

            if (!itemContext) {
                throw new Error(`Could not find ${hodQueryContext.type} with id ${hodQueryContext.id}`);
            }

            const prompt = `The CTO is asking about the following ${hodQueryContext.type}:\n\n${JSON.stringify(itemContext)}\n\nThe specific question is: "${query}"\n\nProvide a concise, data-driven report answering the question. The full project state is provided below for context, but focus your answer on the specific item queried.\n\nFull Project State:\n${JSON.stringify(projectContext)}`;

            if (provider === 'Gemini') {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: { systemInstruction: HEAD_OF_DEVELOPMENT_SYSTEM_PROMPT }
                });
                setHodQueryResponse(response.text);
            } else if (provider === 'OpenRouter') {
                const apiKey = process.env.OPENROUTER_API_KEY || process.env.API_KEY;
                if (!apiKey) {
                    setHodQueryResponse('OpenRouter API key is missing.');
                    return;
                }
                const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: HEAD_OF_DEVELOPMENT_SYSTEM_PROMPT },
                            { role: 'user', content: prompt }
                        ],
                        response_format: { type: 'json_object' }
                    })
                });
                const data = await resp.json();
                setHodQueryResponse(data.choices[0].message.content);
            } else {
                setHodQueryResponse(`Provider ${provider} not supported.`);
            }
    
    
        } catch (error) {
            console.error("HoD Contextual Query Error:", error);
            setHodQueryResponse("CTO, I've encountered a processing anomaly while analyzing your query. Please check the system logs or try again.");
        } finally {
            setHodQueryStatus('idle');
        }
    };


  // Command Palette Logic
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(v => !v);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

  const commands: Command[] = useMemo(() => {
    if (!activeProject) return [];
    
    const navigationCommands: Command[] = [
        { id: 'nav-dash', name: 'Go to Dashboard', description: 'Navigate to the main project dashboard', type: 'navigation', icon: <DashboardIcon className="w-5 h-5"/>, action: () => setCurrentView('dashboard') },
        { id: 'nav-nexus-roadmap', name: 'Go to Nexus Roadmap', description: 'Manage autonomous development roadmap', type: 'navigation', icon: <RoadmapIcon className="w-5 h-5"/>, action: () => setCurrentView('nexus-roadmap') },
        { id: 'nav-hod', name: 'Go to AI Head of Dev', description: 'Brief the AI Head of Development', type: 'navigation', icon: <HeadOfDevIcon className="w-5 h-5"/>, action: () => setCurrentView('ai-head-of-dev') },
        { id: 'nav-work', name: 'Go to Workspace', description: 'View and edit project files', type: 'navigation', icon: <WorkspaceIcon className="w-5 h-5"/>, action: () => setCurrentView('workspace') },
        { id: 'nav-mem', name: 'Go to Memory', description: 'Query and manage project memory', type: 'navigation', icon: <MemoryIcon className="w-5 h-5"/>, action: () => setCurrentView('memory') },
        { id: 'nav-int', name: 'Go to Integrations', description: 'Manage cloud service integrations', type: 'navigation', icon: <IntegrationsIcon className="w-5 h-5"/>, action: () => setCurrentView('integrations') },
        { id: 'nav-apikeys', name: 'Go to API Keys', description: 'Manage AI provider API keys', type: 'navigation', icon: <KeyIcon className="w-5 h-5"/>, action: () => setCurrentView('apikeys') },
        { id: 'nav-assistant-settings', name: 'Go to Assistant Settings', description: 'Configure the AI Assistant', type: 'navigation', icon: <SettingsIcon className="w-5 h-5"/>, action: () => setCurrentView('assistant-settings') },
        { id: 'nav-sys', name: 'Go to System', description: 'View system status and health', type: 'navigation', icon: <SystemIcon className="w-5 h-5"/>, action: () => setCurrentView('system') },
        { id: 'nav-neu', name: 'Go to Neural', description: 'Access neural and cognitive tools', type: 'navigation', icon: <BrainIcon className="w-5 h-5"/>, action: () => setCurrentView('neural') },
        { id: 'nav-daa', name: 'Go to DAA', description: 'Manage Dynamic Agent Architecture', type: 'navigation', icon: <DAAIcon className="w-5 h-5"/>, action: () => setCurrentView('daa') },
        { id: 'nav-flow', name: 'Go to Workflows', description: 'Manage automation workflows', type: 'navigation', icon: <WorkflowIcon className="w-5 h-5"/>, action: () => setCurrentView('workflows') },
        { id: 'nav-tools', name: 'Go to MCP Tools', description: 'Browse all available MCP tools', type: 'navigation', icon: <ToolsIcon className="w-5 h-5"/>, action: () => setCurrentView('tools') },
    ];
    
    const actionCommands: Command[] = [
        { id: 'act-spawn', name: 'Spawn New Hive', description: 'Create a new persistent hive-mind session', type: 'action', icon: <PlusIcon className="w-5 h-5"/>, action: () => { setCurrentView('dashboard'); setIsSpawnModalOpen(true); } },
        { id: 'act-create-agent', name: 'Create DAA Agent', description: 'Create a new specialized dynamic agent', type: 'action', icon: <PlusIcon className="w-5 h-5"/>, action: () => setCurrentView('daa') /* Modal will be opened from DAAView */ },
    ];

    const workflowCommands: Command[] = activeProject.workflows.map((wf: Workflow) => ({
        id: `wf-${wf.id}`,
        name: `Run Workflow: ${wf.name}`,
        description: wf.description,
        type: 'action',
        icon: <WorkflowIcon className="w-5 h-5" />,
        action: () => addLog(`Executing workflow: "${wf.name}"...`, 'info', true)
    }));

    return [...navigationCommands, ...actionCommands, ...workflowCommands];
  }, [activeProject]);

  const renderView = () => {
    if (!activeProject) return null;
    switch (currentView) {
      case 'dashboard':
        return <DashboardView project={activeProject} onSpawnHive={() => setIsSpawnModalOpen(true)} onUpdateHive={handleUpdateHive} onRunSwarm={handleRunSwarm} onDestroyHive={handleDestroyHive} onInitiateProject={() => setIsInitiateModalOpen(true)} onQueryHoD={handleOpenHodQueryModal} />;
      case 'nexus-roadmap':
        return <NexusView project={activeProject} addLog={addLog} onUpdateMission={handleUpdateMission} onQueenCommand={handleQueenCommand} onMissionAction={handleMissionAction} onQueryHoD={handleOpenHodQueryModal} />;
      case 'ai-head-of-dev':
        return <AIHeadOfDevelopmentView project={activeProject} chatHistory={hodChatHistory} onProcessCommand={handleProcessHoDCommand} status={hodStatus} />;
      case 'workspace':
        return <WorkspaceView project={activeProject} addLog={addLog} />;
      case 'memory':
        return <MemoryView project={activeProject} onStoreMemory={handleStoreMemory} addLog={addLog} />;
      case 'settings':
        return <SettingsView project={activeProject} addLog={addLog} />;
       case 'neural':
        return <NeuralView project={activeProject} addLog={addLog} />;
      case 'tools':
        return <MCPToolsView />;
      case 'daa':
        return <DAAView project={activeProject} addLog={addLog} onCreateAgent={handleCreateAgent} onStartConsensus={handleStartConsensus} onQueryHoD={handleOpenHodQueryModal} />;
      case 'workflows':
        return <WorkflowsView project={activeProject} addLog={addLog} onCreateWorkflow={handleCreateWorkflow} onQueryHoD={handleOpenHodQueryModal} />;
      case 'system':
        return <SystemView project={activeProject} addLog={addLog} />;
      case 'integrations':
        return <IntegrationsView project={activeProject} onUpdateIntegration={handleUpdateIntegration} addLog={addLog} />;
      case 'apikeys':
        return <ApiKeysView project={activeProject} onUpdateApiKeys={handleUpdateApiKeys} addLog={addLog} />;
      case 'admin':
        return <AdminView />;
      case 'assistant-settings':
        return <AssistantSettingsView project={activeProject} onUpdateSettings={handleUpdateAssistantSettings} addLog={addLog} />;
      default:
        return <DashboardView project={activeProject} onSpawnHive={() => setIsSpawnModalOpen(true)} onUpdateHive={handleUpdateHive} onRunSwarm={handleRunSwarm} onDestroyHive={handleDestroyHive} onInitiateProject={() => setIsInitiateModalOpen(true)} onQueryHoD={handleOpenHodQueryModal}/>;
    }
  };

  if (!activeProject) {
    return <ProjectSelector projects={projects} onSelectProject={handleSelectProject} onCreateProject={handleCreateProject} />;
  }

  return (
    <div className="flex h-screen bg-[#050608] text-[#E0E0E0]">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onExitProject={handleExitProject} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header projectName={activeProject.name} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} onOpenSettings={() => setCurrentView('assistant-settings')} />
        <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${isActivityLogOpen ? 'mb-48' : 'mb-12'}`}>
          {renderView()}
        </main>
        {activeProject && (
          <Assistant
            status={assistantStatus}
            chatHistory={chatHistory}
            onProcessCommand={handleProcessCommand}
            language={activeProject.assistantSettings.language}
            onOpenSettings={() => setCurrentView('assistant-settings')}
            isEnabled={activeProject.assistantSettings.enabled}
          />
        )}
      </div>
      <ActivityLog 
          logs={activityLog} 
          onClear={() => setActivityLog([])} 
          isOpen={isActivityLogOpen}
          onToggle={() => setIsActivityLogOpen(!isActivityLogOpen)}
      />
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(current => current.filter(t => t.id !== id))} />
       <SpawnHiveModal isOpen={isSpawnModalOpen} onClose={() => setIsSpawnModalOpen(false)} onSpawn={handleSpawnHive} />
       <InitiateProjectModal isOpen={isInitiateModalOpen} onClose={() => setIsInitiateModalOpen(false)} onInitiate={handleInitiateAutonomousProject} addLog={addLog} />
       <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} />
       <HoDQueryModal 
        isOpen={isHodQueryModalOpen} 
        onClose={() => setIsHodQueryModalOpen(false)} 
        context={hodQueryContext} 
        onQuery={handleProcessHodContextualQuery}
        response={hodQueryResponse}
        status={hodQueryStatus}
      />
    </div>
  );
};

export default App;
