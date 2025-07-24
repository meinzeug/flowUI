import React, { useState, useMemo, useEffect } from 'react';
import { Project, Mission, MissionStage, SubTask, ActivityLogEntry, DAAgent, HoDQueryContext } from '../../types';
import { Card, Button, Loader } from '../UI';
import { NexusIcon, AgentIcon, GitHubIcon, PaperAirplaneIcon, CheckCircleIcon, HeadOfDevIcon } from '../Icons';

const STAGES: MissionStage[] = ['Backlog', 'Specification', 'In Progress', 'Review', 'Done'];
const STAGE_COLORS: Record<MissionStage, string> = {
    'Backlog': 'border-slate-500',
    'Specification': 'border-fuchsia-500',
    'In Progress': 'border-cyan-500',
    'Review': 'border-yellow-500',
    'Done': 'border-green-500',
};

const SubTaskItem: React.FC<{ task: SubTask, onToggle: () => void }> = ({ task, onToggle }) => {
    const statusClasses = {
        pending: 'border-slate-600',
        in_progress: 'border-cyan-500 animate-pulse',
        complete: 'border-green-500',
    };
    const textClasses = {
        pending: 'text-slate-400',
        in_progress: 'text-cyan-400',
        complete: 'text-green-400 line-through',
    };

    return (
        <div className="flex items-center gap-3 py-1">
            <button onClick={onToggle} className={`w-5 h-5 rounded-full border-2 ${statusClasses[task.status]} flex items-center justify-center`}>
                 {task.status === 'complete' && <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>}
            </button>
            <span className={`flex-grow text-sm ${textClasses[task.status]}`}>{task.description}</span>
            {task.agent && <AgentIcon agent={task.agent} className="text-lg" />}
        </div>
    );
};

const MissionCard: React.FC<{
    mission: Mission;
    agents: DAAgent[];
    onUpdate: (id: string, updates: Partial<Mission>) => void;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ mission, agents, onUpdate, onQueryHoD }) => {
    const assignedAgents = useMemo(() => agents.filter(a => mission.assignedAgentIds.includes(a.id)), [agents, mission.assignedAgentIds]);
    const completedTasks = mission.subTasks.filter(t => t.status === 'complete').length;
    const progress = mission.subTasks.length > 0 ? (completedTasks / mission.subTasks.length) * 100 : mission.stage === 'Done' ? 100 : 0;

    const priorityClasses = {
        'High': 'bg-red-500/20 text-red-400',
        'Medium': 'bg-yellow-500/20 text-yellow-400',
        'Low': 'bg-slate-500/20 text-slate-400',
    };

    const handleSubTaskToggle = (taskId: string) => {
        const newSubTasks = mission.subTasks.map(task => {
            if (task.id === taskId) {
                const newStatus: SubTask['status'] = task.status === 'complete' ? 'pending' : 'complete';
                return { ...task, status: newStatus };
            }
            return task;
        });
        onUpdate(mission.id, { subTasks: newSubTasks });
    };

    const handleMoveToNextStage = () => {
        const currentIndex = STAGES.indexOf(mission.stage);
        if (currentIndex < STAGES.length - 1) {
            onUpdate(mission.id, { stage: STAGES[currentIndex + 1] });
        }
    };
    
    return (
        <Card className="w-full space-y-4">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-lg flex-grow">{mission.title}</h4>
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => onQueryHoD({ type: 'Mission', id: mission.id, name: mission.title })}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-700/50 hover:text-cyan-400 transition-colors"
                        title="Query HoD about this mission"
                    >
                        <HeadOfDevIcon className="w-5 h-5"/>
                    </button>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityClasses[mission.priority]}`}>{mission.priority}</span>
                </div>
            </div>
            <p className="text-sm text-slate-400">{mission.description}</p>
            
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-400">Progress</span>
                    <span className="text-xs font-bold text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
                </div>
            </div>

            {mission.subTasks.length > 0 && (
                <div className="border-t border-slate-700/50 pt-3">
                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Sub-tasks</h5>
                    <div className="space-y-1">
                        {mission.subTasks.map(task => <SubTaskItem key={task.id} task={task} onToggle={() => handleSubTaskToggle(task.id)} />)}
                    </div>
                </div>
            )}
            
            <div className="border-t border-slate-700/50 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                     <span className="text-sm font-semibold text-slate-300">Agents</span>
                     <div className="flex -space-x-2">
                        {assignedAgents.length > 0 ? assignedAgents.map(agent => (
                            <div key={agent.id} title={agent.type} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-800">
                                <AgentIcon agent={agent.type} />
                            </div>
                        )) : <span className="text-xs text-slate-500">Unassigned</span>}
                    </div>
                </div>
                {(mission.githubIssueId || mission.githubPRId) &&
                    <div className="flex items-center justify-between">
                         <span className="text-sm font-semibold text-slate-300">GitHub</span>
                         <div className="flex items-center gap-2">
                            {mission.githubIssueId && <a href={`#`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white"><GitHubIcon className="w-4 h-4"/> #{mission.githubIssueId}</a>}
                            {mission.githubPRId && <a href={`#`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white"><GitHubIcon className="w-4 h-4"/> PR #{mission.githubPRId}</a>}
                         </div>
                    </div>
                }
            </div>

            {mission.stage !== 'Done' && (
                <div className="pt-3 border-t border-slate-700/50">
                    <Button variant="secondary" className="w-full text-sm" onClick={handleMoveToNextStage}>Move to "{STAGES[STAGES.indexOf(mission.stage) + 1]}"</Button>
                </div>
            )}
        </Card>
    );
};

const QueenConsole: React.FC<{ onCommand: (cmd: string) => void }> = ({ onCommand }) => {
    const [command, setCommand] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleSubmit = () => {
        if (!command || isThinking) return;
        setIsThinking(true);
        onCommand(command);
        setCommand('');
        setTimeout(() => setIsThinking(false), 2500);
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl shadow-magenta animate-pulsate">
                       <AgentIcon agent="Queen" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Queen's Console</h3>
                        <p className="text-slate-400">Delegate high-level objectives to the Queen agent.</p>
                    </div>
                </div>
                <div className="flex-grow w-full md:w-auto flex items-center gap-2">
                    <input
                        type="text"
                        value={command}
                        onChange={e => setCommand(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSubmit()}
                        placeholder="e.g., Plan the payments integration feature"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                        disabled={isThinking}
                    />
                    <Button onClick={handleSubmit} disabled={isThinking} className="px-4 h-[50px]">
                        {isThinking ? <Loader text="" /> : <PaperAirplaneIcon className="w-5 h-5"/>}
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const NexusView: React.FC<{ 
    project: Project; 
    addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void;
    onUpdateMission: (missionId: string, updates: Partial<Mission>) => void;
    onQueenCommand: (command: string) => void;
    onMissionAction: (missionId: string, action: string) => void;
    onQueryHoD: (context: HoDQueryContext) => void;
}> = ({ project, addLog, onUpdateMission, onQueenCommand, onQueryHoD }) => {
    const missionsByStage = useMemo(() => {
        const grouped: Record<MissionStage, Mission[]> = {
            'Backlog': [], 'Specification': [], 'In Progress': [], 'Review': [], 'Done': [],
        };
        project.roadmap.forEach(mission => {
            grouped[mission.stage].push(mission);
        });
        return grouped;
    }, [project.roadmap]);

    // Simulate agent work on "In Progress" tasks
    useEffect(() => {
        const interval = setInterval(() => {
            const missionsInProgress = project.roadmap.filter(m => m.stage === 'In Progress');
            if (missionsInProgress.length === 0) return;

            const randomMission = missionsInProgress[Math.floor(Math.random() * missionsInProgress.length)];
            const pendingTasks = randomMission.subTasks.filter(t => t.status === 'pending');
            const inProgressTasks = randomMission.subTasks.filter(t => t.status === 'in_progress');

            let taskToUpdate: SubTask | undefined;
            let newStatus: SubTask['status'] = 'in_progress';

            if (inProgressTasks.length > 0 && Math.random() > 0.5) {
                // Complete an in-progress task
                taskToUpdate = inProgressTasks[Math.floor(Math.random() * inProgressTasks.length)];
                newStatus = 'complete';
            } else if (pendingTasks.length > 0) {
                // Start a new task
                taskToUpdate = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
                newStatus = 'in_progress';
            }
            
            if (taskToUpdate) {
                const updatedSubTasks = randomMission.subTasks.map(t => t.id === taskToUpdate!.id ? { ...t, status: newStatus } : t);
                onUpdateMission(randomMission.id, { subTasks: updatedSubTasks });
                addLog(`Agent ${taskToUpdate.agent || 'Worker'} updated task "${taskToUpdate.description}" to ${newStatus}.`, 'info');
            }
        }, 3000); // simulate work every 3 seconds

        return () => clearInterval(interval);
    }, [project.roadmap, onUpdateMission, addLog]);


    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2"><NexusIcon className="w-8 h-8" /> Autonomous Development Nexus</h2>
                    <p className="text-slate-400 mt-1">AI-driven project roadmap and execution monitoring.</p>
                </div>
            </div>
            
            <QueenConsole onCommand={onQueenCommand} />
            
            <div className="flex gap-6 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    <div key={stage} className="w-96 flex-shrink-0">
                        <h3 className={`font-bold text-white border-b-4 pb-2 mb-4 flex justify-between ${STAGE_COLORS[stage]}`}>
                            <span>{stage}</span>
                            <span className="bg-slate-700 text-white rounded-full px-2.5 py-0.5 text-sm">{missionsByStage[stage].length}</span>
                        </h3>
                        <div className="space-y-4 h-[calc(100vh-28rem)] overflow-y-auto pr-2">
                           {missionsByStage[stage].length > 0 
                                ? missionsByStage[stage].map(mission => (
                                    <MissionCard 
                                        key={mission.id} 
                                        mission={mission} 
                                        agents={project.daaAgents}
                                        onUpdate={onUpdateMission}
                                        onQueryHoD={onQueryHoD}
                                    />
                                  ))
                                : <div className="text-center text-slate-500 pt-10 text-sm h-full flex items-center justify-center">
                                    <p>Missions will appear here as they are planned or moved.</p>
                                  </div>
                            }
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default NexusView;