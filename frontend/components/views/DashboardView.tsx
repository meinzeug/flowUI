



import React, { useState, useEffect } from 'react';
import { Project, Hive, HiveStatus, HoDQueryContext } from '../../types';
import { Card, Button, Modal, Loader } from '../UI';
import { AgentIcon, HeadOfDevIcon, NexusIcon } from '../Icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const HiveStatusIndicator: React.FC<{ status: HiveStatus }> = ({ status }) => {
  const statusConfig = {
    [HiveStatus.Active]: { color: 'bg-green-500', text: 'Active' },
    [HiveStatus.Processing]: { color: 'bg-cyan-500 animate-pulse', text: 'Processing' },
    [HiveStatus.Paused]: { color: 'bg-yellow-500', text: 'Paused' },
    [HiveStatus.Idle]: { color: 'bg-slate-500', text: 'Idle' },
  };
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
      <span className="text-sm font-medium text-slate-300">{config.text}</span>
    </div>
  );
};


const RunSwarmModal: React.FC<{ isOpen: boolean, onClose: () => void, onRun: (task: string, continueSessionId?: string) => void, activeHives: Hive[] }> = ({ isOpen, onClose, onRun, activeHives }) => {
    const [task, setTask] = useState('');
    const [continueSessionId, setContinueSessionId] = useState<string | undefined>();
    
    const handleRun = () => {
        if(!task) return;
        onRun(task, continueSessionId);
        onClose();
        setTask('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Execute a Quick Task (Swarm)">
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-2">Task Description</label>
                    <input type="text" value={task} onChange={e => setTask(e.target.value)} placeholder='e.g., "Fix the login bug"' className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                {activeHives.length > 0 && (
                    <div>
                         <label className="block text-sm font-medium text-slate-300 mb-2">Continue Session (Optional)</label>
                         <select onChange={e => setContinueSessionId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="">Don't continue a session</option>
                            {activeHives.map(hive => (
                                <option key={hive.id} value={hive.id}>{hive.name} ({hive.namespace})</option>
                            ))}
                         </select>
                         <p className="text-xs text-slate-400 mt-1">Select an active hive to continue its context for this task.</p>
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleRun}>Execute Swarm</Button>
                </div>
             </div>
        </Modal>
    );
};

const HiveDetailModal: React.FC<{
    hive: Hive | null;
    onClose: () => void;
    onUpdateHive: (hiveId: string, updates: Partial<Hive>) => void;
    onDestroyHive: (hiveId: string) => void;
}> = ({ hive, onClose, onUpdateHive, onDestroyHive }) => {
    const [name, setName] = useState(hive?.name || '');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (hive) {
            setName(hive.name);
            setIsEditing(false);
        }
    }, [hive]);

    if (!hive) return null;

    const handlePause = () => onUpdateHive(hive.id, { status: HiveStatus.Paused });
    const handleResume = () => onUpdateHive(hive.id, { status: HiveStatus.Active });
    const handleDestroy = () => {
        onDestroyHive(hive.id);
        onClose();
    };
    const handleSaveName = () => {
        onUpdateHive(hive.id, { name });
        setIsEditing(false);
    };

    return (
        <Modal isOpen={!!hive} onClose={onClose} title="Hive Details">
            <div className="space-y-4">
                {isEditing ? (
                    <div className="flex gap-2">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                        <Button onClick={handleSaveName}>Save</Button>
                    </div>
                ) : (
                    <h2 className="text-2xl font-bold text-white flex items-center justify-between">
                       {hive.name}
                        <Button variant="ghost" className="text-sm" onClick={() => setIsEditing(true)}>Rename</Button>
                    </h2>
                )}

                <div>
                    <p className="font-mono text-fuchsia-400">{hive.namespace}</p>
                    <p className="text-slate-400 text-sm">Session ID: {hive.id}</p>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-medium">Status</span>
                    <HiveStatusIndicator status={hive.status} />
                </div>
                <div>
                    <h4 className="text-slate-300 font-medium mb-2">Assigned Agents</h4>
                    <div className="flex flex-wrap gap-2">
                        {hive.agents.map(agent => (
                            <div key={agent} className="bg-slate-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                                <AgentIcon agent={agent} className="text-lg" />
                                {agent}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                    {hive.status === HiveStatus.Active || hive.status === HiveStatus.Processing ? (
                        <Button variant="secondary" onClick={handlePause}>Pause Session</Button>
                    ) : (
                        <Button variant="secondary" onClick={handleResume}>Resume Session</Button>
                    )}
                    <Button onClick={handleDestroy} className="bg-red-600 hover:bg-red-500">Destroy Hive</Button>
                </div>
            </div>
        </Modal>
    )
}

const GlobalSwarmFeed: React.FC = () => {
    const [events, setEvents] = useState<string[]>([]);
    const eventTypes = [
        "TASK_START: CoderAgent starts 'refactor(api.js)'",
        "HOOK_TRIGGER: pre-edit on 'src/api.js'",
        "COMMUNICATION: ArchitectAgent sends 'schema-update' to CoderAgent",
        "MEMORY_WRITE: AnalystAgent stores 'performance-metrics' in 'reporting' namespace",
        "NEURAL_PREDICT: QueenAgent requests prediction from task-optimizer model",
        "TASK_COMPLETE: CoderAgent completes 'refactor(api.js)'",
        "HOOK_TRIGGER: post-task hook training neural pattern 'refactoring'",
        "RESOURCE_SCALE: DAA scales SecurityAgent memory to 2048MB",
        "GITHUB_ACTION: PR #101 review requested by CoderAgent",
        "IDLE: TesterAgent is idle, awaiting tasks",
        "MEMORY_QUERY: ResearcherAgent queries for 'microservices'",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setEvents(prev => {
                const newEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                const timestamp = new Date().toLocaleTimeString();
                const fullEvent = `[${timestamp}] ${newEvent}`;
                const newEvents = [fullEvent, ...prev];
                return newEvents.slice(0, 50); // Keep last 50 events
            });
        }, 2000 + Math.random() * 2000); // Random interval between 2-4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
         <Card>
            <h3 className="text-xl font-bold text-white mb-4">Global Swarm Feed</h3>
            <div className="h-72 bg-slate-950/50 rounded-lg p-3 font-mono text-xs overflow-y-auto flex flex-col-reverse border border-slate-700/50">
                <div className="space-y-1">
                {events.map((event, index) => (
                    <p key={index} className="text-slate-400 animate-fade-in-up" style={{ animationDelay: '0ms', animationDuration: '300ms' }}>
                        {event.includes('COMPLETE') || event.includes('START') ? <span className="text-green-400">{event}</span> : event.includes('RESOURCE') || event.includes('HOOK') ? <span className="text-cyan-400">{event}</span> : event.includes('MEMORY') || event.includes('NEURAL') ? <span className="text-fuchsia-400">{event}</span> : event}
                    </p>
                ))}
                </div>
            </div>
        </Card>
    );
}


const DashboardView: React.FC<{ 
    project: Project; 
    onSpawnHive: () => void; 
    onUpdateHive: (hiveId: string, updates: Partial<Hive>) => void; 
    onRunSwarm: (task: string, continueSessionId?: string) => void;
    onDestroyHive: (hiveId: string) => void;
    onInitiateProject: () => void;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ project, onSpawnHive, onUpdateHive, onRunSwarm, onDestroyHive, onInitiateProject, onQueryHoD }) => {
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState(false);
  const [selectedHive, setSelectedHive] = useState<Hive | null>(null);
  const [benchScore, setBenchScore] = useState(84.8);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  
  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
        const newScore = (Math.random() * (86 - 84.5) + 84.5).toFixed(2);
        setBenchScore(parseFloat(newScore));
        setIsBenchmarking(false);
    }, 3000);
  }

  const healthData = [{ name: 'Healthy', value: project.systemServices.filter(s => s.status === 'Operational').length }, { name: 'Issues', value: project.systemServices.filter(s => s.status !== 'Operational').length }];
  const COLORS = ['#00FFED', '#FF0090'];
  
  const activeHives = project.hives.filter(h => h.status === HiveStatus.Active || h.status === HiveStatus.Processing);
  const otherHives = project.hives.filter(h => h.status !== HiveStatus.Active && h.status !== HiveStatus.Processing);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <section>
        <Card>
          <div className="flex flex-col md:flex-row gap-6 justify-around items-center">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Launch New Project</h3>
              <p className="text-slate-400 text-sm mb-4">Define a concept and let AI build the roadmap and team.</p>
              <Button onClick={onInitiateProject} className="bg-gradient-to-br from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-magenta hover:shadow-magenta-lg w-full text-lg py-3 px-8">
                <NexusIcon className="w-6 h-6" />
                Initiate Autonomous Project
              </Button>
            </div>
            <div className="w-px bg-slate-700 h-24 hidden md:block"></div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Quick Actions</h3>
              <p className="text-slate-400 text-sm mb-4">Run a one-off task or create a manual session.</p>
              <div className="flex gap-4">
                  <Button variant="primary" onClick={() => setIsSwarmModalOpen(true)}>Run Temp Task</Button>
                  <Button variant="secondary" onClick={onSpawnHive}>Spawn Hive</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlobalSwarmFeed />

        <section>
            <Card>
            <h3 className="text-xl font-bold text-white mb-4">Performance & Monitoring</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-300">Token Usage (24h)</span>
                    <span className="font-bold text-white font-mono">1.2M</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-300">SWE-Bench Solve Rate</span>
                    <span className="font-bold text-green-400 font-mono">{benchScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-300">Overall System Health</span>
                     <span className={`font-bold font-mono ${healthData[1].value > 0 ? 'text-yellow-400' : 'text-cyan-400'}`}>{healthData[1].value > 0 ? 'Degraded' : 'Operational'}</span>
                </div>
                 <div className="h-32">
                    {isBenchmarking ? <Loader text="Running benchmark..."/> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={healthData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} fill="#8884d8" paddingAngle={5}>
                                    {healthData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: '#334155'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
                 <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <Button 
                        variant="secondary" 
                        className="w-full" 
                        onClick={handleRunBenchmark}
                        disabled={isBenchmarking}
                    >
                        {isBenchmarking ? 'Benchmarking...' : 'Run Performance Benchmark'}
                    </Button>
                </div>
            </div>
          </Card>
        </section>
      </div>


      {activeHives.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Active Hives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeHives.map((hive) => (
              <Card key={hive.id} onClick={() => setSelectedHive(hive)}>
                 <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white truncate pr-4">{hive.name}</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onQueryHoD({ type: 'Hive', id: hive.id, name: hive.name });
                        }}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400 transition-colors"
                        title="Query HoD about this hive"
                    >
                        <HeadOfDevIcon className="w-5 h-5"/>
                    </button>
                </div>
                <p className="text-sm text-fuchsia-400 font-mono mt-1">{hive.namespace}</p>
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-slate-400">Agents:</span>
                    <div className="flex gap-1.5">
                    {hive.agents.map(agent => <AgentIcon key={agent} agent={agent} className="text-xl" />)}
                    </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Last activity: {hive.lastActivity}</p>
                    <HiveStatusIndicator status={hive.status} />
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {otherHives.length > 0 && (
         <section>
          <h2 className="text-2xl font-bold text-white mb-4">Session Management</h2>
            <Card className="!p-2">
              <div className="max-h-64 overflow-y-auto pr-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="p-3">Name / Namespace</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Activity</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherHives.map(hive => (
                      <tr key={hive.id} className="border-b border-slate-800 last:border-none hover:bg-slate-800/50">
                        <td className="p-3 cursor-pointer" onClick={() => setSelectedHive(hive)}>
                          <p className="font-bold text-white">{hive.name}</p>
                          <p className="font-mono text-sm text-fuchsia-400">{hive.namespace}</p>
                        </td>
                        <td className="p-3"><HiveStatusIndicator status={hive.status} /></td>
                        <td className="p-3 text-slate-400 text-sm">{hive.lastActivity}</td>
                        <td className="p-3 text-right">
                          <Button variant="secondary" className="px-4 py-1.5 text-sm" onClick={() => onUpdateHive(hive.id, { status: HiveStatus.Active })}>Resume</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
        </section>
      )}

      <RunSwarmModal isOpen={isSwarmModalOpen} onClose={() => setIsSwarmModalOpen(false)} onRun={onRunSwarm} activeHives={activeHives} />
      <HiveDetailModal hive={selectedHive} onClose={() => setSelectedHive(null)} onUpdateHive={onUpdateHive} onDestroyHive={onDestroyHive} />
    </div>
  );
};

export default DashboardView;