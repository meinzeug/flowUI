
import React, { useState, useMemo } from 'react';
import { Project, MemoryEntry, ActivityLogEntry } from '../../types';
import { Card, Button, Modal } from '../UI';
import { SearchIcon, ChartBarIcon } from '../Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const dbTables = [
    { name: 'long_term_memory', description: 'Core knowledge base and historical context.' },
    { name: 'short_term_memory', description: 'Working memory for current tasks.' },
    { name: 'agent_state', description: 'State and configuration for each agent.' },
    { name: 'task_history', description: 'Log of all executed tasks and their outcomes.' },
    { name: 'communication_log', description: 'Record of inter-agent messages.' },
    { name: 'code_embeddings', description: 'Vector representations of code snippets.' },
    { name: 'file_metadata', description: 'Information about workspace files.' },
    { name: 'session_data', description: 'Data related to hive-mind sessions.' },
    { name: 'neural_patterns', description: 'Learned patterns for the cognitive engine.' },
    { name: 'hook_executions', description: 'Logs of all triggered hooks.' },
    { name: 'user_queries', description: 'History of user-provided prompts.' },
    { name: 'consensus_log', description: 'Record of DAA consensus topics and votes.' },
];

const MemoryTableAnalytics: React.FC = () => {
    const analyticsData = useMemo(() => {
        return dbTables.map(table => ({
            name: table.name,
            size: Math.floor(Math.random() * 500 + 50) // Simulated size in KB
        }));
    }, []);

    const COLORS = ['#00FFED', '#FF0090', '#00BFFF', '#8A2BE2', '#32CD32', '#FFD700', '#FF6347', '#4682B4', '#DA70D6', '#20B2AA', '#F4A460', '#BA55D3'];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={analyticsData} dataKey="size" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8">
                    {analyticsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155' }}/>
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} wrapperStyle={{fontSize: '12px'}} />
            </PieChart>
        </ResponsiveContainer>
    );
};

const MemoryAnalytics: React.FC<{ data: MemoryEntry[] }> = ({ data }) => {
    const analyticsData = useMemo(() => {
        const namespaceCounts = data.reduce((acc, entry) => {
            acc[entry.namespace] = (acc[entry.namespace] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(namespaceCounts).map(([name, count]) => ({
            name,
            entries: count,
        })).sort((a, b) => b.entries - a.entries);
    }, [data]);
    
    if (analyticsData.length === 0) return <p className="text-slate-500 text-center pt-8">No data for analytics yet.</p>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: '#334155' }}
                />
                <Bar dataKey="entries" fill="url(#colorUv)" />
                 <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DB2777" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.8}/>
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    );
};


const MemoryCard: React.FC<{ entry: MemoryEntry }> = ({ entry }) => {
    return (
        <Card className="transition-all duration-300 hover:border-fuchsia-500/50 hover:shadow-magenta">
            <p className="font-mono text-sm text-fuchsia-400">{entry.namespace}</p>
            <h4 className="text-lg font-bold text-white mt-2">{entry.query}</h4>
            <p className="text-slate-300 mt-2">{entry.summary}</p>
            <p className="text-xs text-slate-500 mt-4">{new Date(entry.timestamp).toLocaleString()}</p>
        </Card>
    );
};

const StoreMemoryModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    onStore: (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => void;
}> = ({ isOpen, onClose, onStore }) => {
    const [namespace, setNamespace] = useState('default');
    const [query, setQuery] = useState('');
    const [summary, setSummary] = useState('');

    const handleStore = () => {
        if (!query || !summary) return;
        onStore({ namespace, query, summary });
        onClose();
        setNamespace('default');
        setQuery('');
        setSummary('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Store New Memory Entry">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Namespace</label>
                    <input type="text" value={namespace} onChange={e => setNamespace(e.target.value)} placeholder="e.g., default" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Query / Key</label>
                    <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g., project-context" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Summary / Value</label>
                    <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="e.g., Full-stack app requirements" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleStore} className="bg-gradient-to-br from-fuchsia-600 to-indigo-600">Store Memory</Button>
                </div>
            </div>
        </Modal>
    );
};

const ImportExportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    addLog: (message: string, type?: ActivityLogEntry['type']) => void;
}> = ({ isOpen, onClose, addLog }) => {
    const handleBackup = () => {
        addLog("Running command: npx claude-flow memory backup 'backup.json'", 'info');
        setTimeout(() => addLog("Memory backed up successfully to backup.json", 'success'), 1000);
        onClose();
    };
    const handleRestore = () => {
        addLog("Running command: npx claude-flow memory restore 'backup.json'", 'info');
        setTimeout(() => addLog("Memory restored successfully from backup.json. This is a simulation.", 'success'), 1000);
        onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import / Export Memory">
            <div className="space-y-4">
                <p className="text-slate-400">Create a backup of the project's memory or restore it from a file. This simulates the CLI commands.</p>
                <div className="flex justify-around gap-4 pt-4">
                    <Button variant="secondary" onClick={handleBackup}>Backup Memory</Button>
                    <Button variant="secondary" onClick={handleRestore}>Restore Memory</Button>
                </div>
            </div>
        </Modal>
    );
};

const MemoryInternals: React.FC = () => {
    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-4">Memory Internals (SQLite Tables)</h3>
            <p className="text-slate-400 mb-4 text-sm">Claude-Flow uses a persistent SQLite database (`.swarm/memory.db`) with specialized tables for robust, cross-session memory.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbTables.map(table => (
                    <div key={table.name} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <p className="font-mono font-bold text-fuchsia-400">{table.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{table.description}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

const MemoryView: React.FC<{ project: Project; onStoreMemory: (entry: Omit<MemoryEntry, 'id' | 'timestamp'>) => void; addLog: (message: string, type?: ActivityLogEntry['type']) => void; }> = ({ project, onStoreMemory, addLog }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);

    const sortedMemory = useMemo(() => {
        return [...project.memory].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [project.memory]);

    const filteredMemory = useMemo(() => {
        if (!searchTerm) {
            return sortedMemory;
        }
        return sortedMemory.filter(entry => 
            entry.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.namespace.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, sortedMemory]);
    
    const recentMemory = useMemo(() => sortedMemory.slice(0, 5), [sortedMemory]);

    const memoryStats = useMemo(() => {
        const namespaces = new Set(project.memory.map(m => m.namespace));
        return {
            totalEntries: project.memory.length,
            namespaces: namespaces.size,
            dbSize: (project.memory.length * 1.5).toFixed(2), // simulated
        };
    }, [project.memory]);

    return (
        <div className="animate-fade-in-up space-y-8">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Project Memory</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card><div className="text-center"><p className="text-3xl font-bold text-fuchsia-400">{memoryStats.totalEntries}</p><p className="text-slate-400">Total Entries</p></div></Card>
                    <Card><div className="text-center"><p className="text-3xl font-bold text-fuchsia-400">{memoryStats.namespaces}</p><p className="text-slate-400">Namespaces</p></div></Card>
                    <Card><div className="text-center"><p className="text-3xl font-bold text-fuchsia-400">{memoryStats.dbSize} <span className="text-xl">MB</span></p><p className="text-slate-400">Simulated DB Size</p></div></Card>
                    <Card className="flex flex-col items-center justify-center text-center">
                        <ChartBarIcon className="w-8 h-8 text-fuchsia-400 mb-2"/>
                        <p className="text-slate-400 font-semibold">Memory Analytics</p>
                    </Card>
                </div>
            </section>
            
            <section>
                 <Card>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Query memory... (e.g., 'authentication')"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center">
                          <Button variant="secondary" onClick={() => setIsStoreModalOpen(true)}>Store</Button>
                          <Button variant="secondary" onClick={() => setIsImportExportModalOpen(true)}>Import/Export</Button>
                          <Button variant="secondary" onClick={() => addLog('Running command: c-f memory compress', 'info')}>Compress</Button>
                          <Button variant="secondary" onClick={() => addLog('Running command: c-f memory sync', 'info')}>Sync</Button>
                        </div>
                    </div>
                </Card>
            </section>

            {searchTerm === '' && (
                 <section>
                    <h3 className="text-xl font-bold text-white mb-4">Recent Entries</h3>
                     {recentMemory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentMemory.map(entry => <MemoryCard key={entry.id} entry={entry} />)}
                        </div>
                    ) : (
                        <Card><p className="text-center text-slate-400 py-8">No memory entries yet. Store one to get started.</p></Card>
                    )}
                </section>
            )}
            
            <section>
                <h3 className="text-xl font-bold text-white mb-4">
                    {searchTerm ? `Found ${filteredMemory.length} results` : 'All Entries'}
                </h3>
                {filteredMemory.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMemory.map(entry => <MemoryCard key={entry.id} entry={entry} />)}
                    </div>
                ) : (
                    <Card>
                        <p className="text-center text-slate-400 py-8">No memory entries found.</p>
                    </Card>
                )}
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <section>
                    <h2 className="text-xl font-bold text-white mb-4">Namespace Distribution</h2>
                    <Card>
                        <div className="h-80">
                            <MemoryAnalytics data={project.memory} />
                        </div>
                    </Card>
                </section>
                <section>
                    <h2 className="text-xl font-bold text-white mb-4">Table Distribution (Simulated)</h2>
                    <Card>
                        <div className="h-80">
                            <MemoryTableAnalytics />
                        </div>
                    </Card>
                </section>
            </div>

             <section>
                <MemoryInternals />
            </section>


            <StoreMemoryModal 
                isOpen={isStoreModalOpen}
                onClose={() => setIsStoreModalOpen(false)}
                onStore={onStoreMemory}
            />
            <ImportExportModal
                isOpen={isImportExportModalOpen}
                onClose={() => setIsImportExportModalOpen(false)}
                addLog={addLog}
            />
        </div>
    );
};

export default MemoryView;
