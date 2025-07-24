import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Project, ChatMessage, AssistantStatus, DAAgent } from '../../types';
import { Card, Button, Loader } from '../UI';
import { AgentIcon, HeadOfDevIcon, PaperAirplaneIcon } from '../Icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const marked = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-cyan-400 mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3 border-b-2 border-slate-700 pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 list-disc">$1</li>')
        .replace(/\n/g, '<br />');

    // Handle lists that might be broken by br tags
    html = html.replace(/<\/li><br \/>/g, '</li>');
    html = html.replace(/(<li.*>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br \/><ul>/g, '');

    return html;
};

const ProjectVitals: React.FC<{ project: Project }> = ({ project }) => {
    const vitals = useMemo(() => {
        const totalMissions = project.roadmap.length;
        const completedMissions = project.roadmap.filter(m => m.stage === 'Done').length;
        const progress = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;
        
        const highRiskCount = project.roadmap.filter(m => m.risk === 'High' && m.stage !== 'Done').length;
        
        const agentTypes = project.daaAgents.reduce((acc, agent) => {
            if (agent.status !== 'Terminated') {
                 acc[agent.type] = (acc[agent.type] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const agentDistribution = Object.entries(agentTypes).map(([name, value]) => ({ name, value }));
        
        return { progress, highRiskCount, agentDistribution, totalAgents: project.daaAgents.filter(a => a.status !== 'Terminated').length };
    }, [project]);

    const COLORS = ['#00FFED', '#FF0090', '#00BFFF', '#8A2BE2', '#32CD32', '#FFD700', '#FF6347'];

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">Project Vitals</h3>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-slate-300">Overall Roadmap Progress</span>
                        <span className="text-sm font-bold text-cyan-400">{Math.round(vitals.progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 h-2.5 rounded-full" style={{ width: `${vitals.progress}%` }}></div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Active Agents</span>
                    <span className="font-bold text-white">{vitals.totalAgents}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">High-Risk Missions</span>
                    <span className={`font-bold ${vitals.highRiskCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{vitals.highRiskCount}</span>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2 text-center">Agent Distribution</h4>
                    <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={vitals.agentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} fill="#8884d8" paddingAngle={5}>
                                    {vitals.agentDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: '#334155' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const SwarmIntelligence: React.FC<{ agents: DAAgent[] }> = ({ agents }) => {
    const queens = agents.filter(a => a.type === 'Queen' && a.status !== 'Terminated');
    return (
         <Card className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-white mb-4">Swarm Intelligence</h3>
            <div className="flex-grow space-y-4">
                 <div className="flex flex-col items-center">
                     <HeadOfDevIcon className="w-10 h-10 text-cyan-400" />
                     <p className="text-sm font-bold">Head of Development</p>
                     <div className="w-px h-6 bg-slate-600 my-1"></div>
                 </div>
                 <div className="flex justify-around">
                    {queens.map(queen => (
                        <div key={queen.id} className="flex flex-col items-center">
                             <div className="w-px h-6 bg-slate-600 mb-1"></div>
                            <div className="p-2 bg-slate-800 rounded-full border border-fuchsia-500/50">
                                <AgentIcon agent="Queen" className="w-8 h-8 text-fuchsia-400" />
                            </div>
                            <p className="text-xs mt-1">Queen <span className="text-slate-500">({queen.id.slice(-4)})</span></p>
                             <p className="text-xs text-slate-400 capitalize">{queen.status}</p>
                        </div>
                    ))}
                    {queens.length === 0 && <p className="text-xs text-slate-500 text-center">No Queen agents deployed.</p>}
                 </div>
            </div>
        </Card>
    );
}

interface AIHeadOfDevelopmentViewProps {
    project: Project;
    chatHistory: ChatMessage[];
    onProcessCommand: (command: string) => void;
    status: AssistantStatus;
}

const AIHeadOfDevelopmentView: React.FC<AIHeadOfDevelopmentViewProps> = ({ project, chatHistory, onProcessCommand, status }) => {
    const [directive, setDirective] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendDirective = () => {
        if (directive.trim() && status !== 'thinking') {
            onProcessCommand(directive);
            setDirective('');
        }
    }

    return (
        <div className="h-[calc(100vh-14rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
            <div className="lg:col-span-3 h-full overflow-y-auto">
                <ProjectVitals project={project} />
            </div>

            <div className="lg:col-span-6 h-full flex flex-col bg-slate-900/50 border border-slate-700/50 rounded-2xl">
                <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white text-center">Briefing Terminal</h2>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-6">
                    {chatHistory.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-xl p-4 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                                <div className="font-bold mb-2 text-sm">
                                    {msg.role === 'user' ? '[CTO DIRECTIVE]' : '[HoD REPORT]'}
                                </div>
                                {typeof msg.content === 'string' ? (
                                    <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: marked(msg.content) }} />
                                ) : (
                                    msg.content
                                )}
                                {msg.suggestions && (
                                    <div className="mt-4 border-t border-slate-700 pt-3 flex flex-wrap gap-2">
                                        {msg.suggestions.map((s, i) => (
                                            <button key={i} onClick={() => onProcessCommand(s.command)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold py-1 px-3 rounded-full">
                                                {s.text}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {status === 'thinking' && (
                        <div className="flex items-start">
                             <div className="max-w-xl p-4 rounded-xl bg-slate-800 text-slate-300">
                                <Loader text="Analyzing..."/>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-slate-700/50 flex-shrink-0">
                     <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={directive}
                            onChange={(e) => setDirective(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendDirective()}
                            placeholder="Issue a directive to your Head of Development..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={status === 'thinking'}
                        />
                        <Button onClick={handleSendDirective} disabled={status === 'thinking' || !directive.trim()} className="h-[50px]">
                           <PaperAirplaneIcon className="w-5 h-5"/>
                        </Button>
                    </div>
                </div>
            </div>

             <div className="lg:col-span-3 h-full overflow-y-auto">
                <SwarmIntelligence agents={project.daaAgents} />
            </div>
        </div>
    );
};

export default AIHeadOfDevelopmentView;