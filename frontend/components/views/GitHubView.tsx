
import React, { useState, useMemo } from 'react';
import { Project, ActivityLogEntry, GitHubPR, GitHubIssue, GitHubBoardStatus, DAAgent } from '../../types';
import { Card, Button } from '../UI';
import { GitHubIcon, AgentIcon } from '../Icons';

const KanbanCard: React.FC<{ issue: GitHubIssue, agent: DAAgent | undefined }> = ({ issue, agent }) => (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
        <p className="font-bold text-white">{issue.title}</p>
        <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">#{issue.id} by {issue.author}</span>
            {agent && (
                <div className="flex items-center gap-2 bg-slate-700 px-2 py-1 rounded-full">
                    <AgentIcon agent={agent.type} />
                    <span>{agent.type}</span>
                </div>
            )}
        </div>
    </div>
);

const KanbanBoard: React.FC<{ issues: GitHubIssue[], agents: DAAgent[] }> = ({ issues, agents }) => {
    const columns: GitHubBoardStatus[] = ['Backlog', 'In Progress', 'Review', 'Done'];

    const getAgentById = (agentId: string) => agents.find(a => a.id === agentId);

    const issuesByColumn = useMemo(() => {
        const grouped: Record<GitHubBoardStatus, GitHubIssue[]> = {
            'Backlog': [],
            'In Progress': [],
            'Review': [],
            'Done': [],
        };
        issues.forEach(issue => {
            const status = issue.boardStatus || 'Backlog';
            if (grouped[status]) {
                grouped[status].push(issue);
            }
        });
        return grouped;
    }, [issues]);

    const columnColors: Record<GitHubBoardStatus, string> = {
        'Backlog': 'border-slate-500',
        'In Progress': 'border-cyan-500',
        'Review': 'border-fuchsia-500',
        'Done': 'border-green-500',
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map(col => (
                <div key={col} className="bg-slate-900/50 p-4 rounded-xl">
                    <h3 className={`font-bold text-white border-b-2 pb-2 mb-4 ${columnColors[col]}`}>{col} ({issuesByColumn[col].length})</h3>
                    <div className="space-y-4 overflow-y-auto h-[400px] pr-2">
                        {issuesByColumn[col].map(issue => (
                           <KanbanCard key={issue.id} issue={issue} agent={issue.agentId ? getAgentById(issue.agentId) : undefined} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};


const GitHubView: React.FC<{ project: Project; addLog: (message: string, type?: ActivityLogEntry['type']) => void; }> = ({ project, addLog }) => {
    const [repoUrl, setRepoUrl] = useState(project.github?.url || '');
    const [isConnected, setIsConnected] = useState(!!project.github);
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    const handleConnect = () => {
        if (!repoUrl.includes('github.com')) {
            addLog('Invalid GitHub repository URL.', 'error');
            return;
        }
        addLog(`Connecting to repository: ${repoUrl}`, 'info');
        setTimeout(() => {
            setIsConnected(true);
            addLog('Successfully connected to GitHub repository.', 'success');
        }, 1000);
    };
    
    const handleRunAnalysis = () => {
        addLog(`Running repository analysis on ${repoUrl}...`, 'info');
        setTimeout(() => {
            addLog('Repository analysis complete. Found 25 components, 5 major workflows.', 'success');
        }, 2000);
    };
    
    if (!isConnected) {
        return (
             <div className="flex items-center justify-center h-full animate-fade-in-up">
                 <Card className="max-w-md w-full">
                    <div className="text-center">
                        <GitHubIcon className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">GitHub Integration</h2>
                        <p className="text-slate-400 mb-6">Connect a GitHub repository to manage PRs, issues, and run code analysis.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/user/repo"
                                className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                            <Button variant="primary" onClick={handleConnect}>Connect</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">GitHub: {repoUrl.replace('https://github.com/', '')}</h2>
                    <p className="text-slate-400 mt-1">Manage your connected repository directly from Claude-Flow.</p>
                </div>
                 <div className="flex-shrink-0 bg-slate-800 p-1 rounded-lg">
                    <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} onClick={() => setViewMode('list')} className="px-3 py-1 text-sm">List View</Button>
                    <Button variant={viewMode === 'board' ? 'secondary' : 'ghost'} onClick={() => setViewMode('board')} className="px-3 py-1 text-sm">Board View</Button>
                </div>
            </div>
            
             <Card>
                <h3 className="text-xl font-bold text-cyan-400 mb-4">GitHub Actions</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="secondary" className="w-full" onClick={handleRunAnalysis}>Analyze Repository</Button>
                    <Button variant="secondary" className="w-full" onClick={() => addLog("AI code review requested for main branch.", "info")}>Run AI Code Review</Button>
                    <Button variant="secondary" className="w-full" onClick={() => addLog("Coordinating new release v1.1.0...", "info")}>Coordinate New Release</Button>
                    <Button variant="secondary" className="w-full" onClick={() => addLog("Syncing with GitHub Actions workflows...", "info")}>Automate Workflows</Button>
                </div>
            </Card>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">Pull Requests ({project.github?.pullRequests.length})</h3>
                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {project.github?.pullRequests.map((pr: GitHubPR) => (
                                <li key={pr.id} className="p-3 bg-slate-800/50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{pr.title}</p>
                                        <p className="text-sm text-slate-400">#{pr.id} by {pr.author}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pr.status === 'Open' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{pr.status}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card>
                        <h3 className="text-xl font-bold text-white mb-4">Issues ({project.github?.issues.length})</h3>
                         <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {project.github?.issues.map((issue: GitHubIssue) => (
                                <li key={issue.id} className="p-3 bg-slate-800/50 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{issue.title}</p>
                                        <p className="text-sm text-slate-400">#{issue.id} by {issue.author}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${issue.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>{issue.status}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            ) : (
                <KanbanBoard issues={project.github?.issues || []} agents={project.daaAgents} />
            )}


        </div>
    );
};

export default GitHubView;
