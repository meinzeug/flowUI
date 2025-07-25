
import React, { useState, useEffect } from 'react';
import { Project, FileNode, ActivityLogEntry } from '../../types';
import { Card, Button } from '../UI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const neuralModels = [
    'task-optimizer', 'cognitive-analysis', 'code-generator', 'pattern-recognizer', 'code-reviewer', 'security-auditor', 'performance-predictor', 'data-importer', 'api-generator'
];

const CognitiveMap: React.FC = () => {
    // A static, simulated visualization of a cognitive map
    const nodes = [
        { id: 'mcp', name: 'MCP', x: 25, y: 50 },
        { id: 'neural', name: 'Neural Engine', x: 50, y: 25 },
        { id: 'memory', name: 'Memory DB', x: 50, y: 75 },
        { id: 'daa', name: 'DAA Controller', x: 75, y: 50 },
        { id: 'github', name: 'GitHub Bridge', x: 90, y: 80 },
    ];
    const edges = [
        { from: 'mcp', to: 'neural' },
        { from: 'mcp', to: 'memory' },
        { from: 'mcp', to: 'daa' },
        { from: 'neural', to: 'memory' },
        { from: 'daa', to: 'neural' },
        { from: 'daa', to: 'github' },
    ];
    return (
        <Card>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Cognitive Map (System Interconnections)</h3>
            <div className="bg-slate-950/50 rounded-lg p-4 h-64 relative border border-slate-700/50">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF0090" />
                            <stop offset="100%" stopColor="#00FFED" />
                        </linearGradient>
                         <filter id="glow">
                            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {edges.map(edge => {
                        const fromNode = nodes.find(n => n.id === edge.from);
                        const toNode = nodes.find(n => n.id === edge.to);
                        if (!fromNode || !toNode) return null;
                        return (
                            <line key={`${edge.from}-${edge.to}`} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="url(#edgeGradient)" strokeWidth="0.5" strokeOpacity="0.7" />
                        )
                    })}
                </svg>
                {nodes.map(node => (
                    <div key={node.id} className="absolute flex flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className="w-8 h-8 bg-slate-800 border-2 border-cyan-400 rounded-full shadow-cyan flex items-center justify-center animate-pulsate">
                        </div>
                         <span className="text-xs font-bold text-white mt-2">{node.name}</span>
                    </div>
                ))}
            </div>
        </Card>
    )
}

const NeuralView: React.FC<{ project: Project; addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void; }> = ({ project, addLog }) => {
    const [trainPattern, setTrainPattern] = useState('coordination');
    const [trainEpochs, setTrainEpochs] = useState(50);
    const [trainDataFile, setTrainDataFile] = useState('');
    const [predictModel, setPredictModel] = useState('task-optimizer');
    const [predictInput, setPredictInput] = useState('');
    const [predictionResult, setPredictionResult] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<{epoch:number,loss:number,accuracy:number}[]>([]);

    useEffect(() => {
        fetch('/metrics/training').then(r => r.json()).then(setMetrics).catch(() => {});
    }, []);
    
    const jsonFiles = project.files.flatMap(function findJson(node: FileNode): string[] {
        if (node.type === 'file' && node.name.endsWith('.json')) {
            return [node.name];
        }
        if (node.type === 'directory' && node.children) {
            return node.children.flatMap(findJson);
        }
        return [];
    });
    
    const handleTrain = () => {
        const cmd = `npx claude-flow neural train --pattern ${trainPattern} --epochs ${trainEpochs} ${trainDataFile ? '--data ' + trainDataFile : ''}`;
        addLog(`Running: ${cmd}`, 'info');
        setTimeout(() => {
            addLog(`Training for pattern "${trainPattern}" completed successfully.`, 'success', true);
        }, 2500);
    };

    const handlePredict = () => {
        const cmd = `npx claude-flow neural predict --model ${predictModel} --input '...'`;
        addLog(`Running: ${cmd}`, 'info');
        setPredictionResult(null);
        setTimeout(() => {
            const mockResult = {
                predictedAction: 'OPTIMIZE_QUERY',
                confidence: 0.92,
                suggestedParameters: {
                    namespace: 'default',
                    cache: true,
                    agent_type: 'Analyst'
                },
                explanation: `The input suggests a data retrieval task. The task-optimizer model recommends using the Analyst agent and caching the query for performance.`
            };
            setPredictionResult(JSON.stringify(mockResult, null, 2));
            addLog(`Prediction received from model "${predictModel}".`, 'success', true);
        }, 1500);
    };

    const handleAnalyze = () => {
        const cmd = `npx claude-flow cognitive analyze --behavior "development-workflow"`;
        addLog(`Running: ${cmd}`, 'info');
        setTimeout(() => {
            addLog(`Cognitive analysis of development workflow completed.`, 'success', true);
        }, 2000);
    };
    
    const handleAdvancedTool = (toolName: string) => {
        const cmd = `npx claude-flow neural ${toolName}`;
        addLog(`Running advanced command: ${cmd}`, 'info');
        setTimeout(() => {
            addLog(`Neural tool "${toolName}" executed successfully (simulation).`, 'success');
        }, 1200);
    };


  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Neural & Cognitive Tools</h2>
        <p className="text-slate-400 mt-1">Leverage 27+ neural models to train patterns, get predictions, and analyze workflows.</p>
      </div>

       <CognitiveMap />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Neural Training */}
        <Card>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Neural Pattern Training</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pattern</label>
                    <input type="text" value={trainPattern} onChange={e => setTrainPattern(e.target.value)} placeholder="e.g., coordination" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Data File (Optional)</label>
                    <select value={trainDataFile} onChange={e => setTrainDataFile(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="">Select a JSON file...</option>
                        {jsonFiles.map(file => <option key={file} value={file}>{file}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Epochs</label>
                    <input type="number" value={trainEpochs} onChange={e => setTrainEpochs(parseInt(e.target.value, 10))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div className="pt-2">
                    <Button variant="primary" className="w-full" onClick={handleTrain}>Start Training</Button>
                </div>
            </div>
        </Card>
        
        {/* Neural Prediction */}
        <Card>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Real-time Prediction</h3>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                    <select value={predictModel} onChange={e => setPredictModel(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {neuralModels.map(model => <option key={model} value={model}>{model}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Input Data (JSON)</label>
                    <textarea value={predictInput} onChange={e => setPredictInput(e.target.value)} rows={3} placeholder='e.g., { "task": "retrieve user data" }' className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div className="pt-2">
                    <Button variant="secondary" className="w-full" onClick={handlePredict}>Get Prediction</Button>
                </div>
                 {predictionResult && (
                    <div className="mt-4 border-t border-slate-700 pt-4">
                        <h4 className="text-slate-300 font-medium mb-2">Prediction Output</h4>
                        <pre className="bg-slate-900 text-cyan-300 p-4 rounded-lg text-xs overflow-x-auto">{predictionResult}</pre>
                    </div>
                )}
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Cognitive Analysis</h3>
            <p className="text-slate-400 mb-4">Analyze cognitive behaviors from development patterns to identify inefficiencies or suggest improvements.</p>
            <Button variant="secondary" className="w-full" onClick={handleAnalyze}>Analyze Development Workflow</Button>
        </Card>

        <Card>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Advanced Neural Tools</h3>
            <div className="grid grid-cols-2 gap-4">
                 <Button variant="secondary" className="w-full" onClick={() => handleAdvancedTool('compress')}>Model Compression</Button>
                 <Button variant="secondary" className="w-full" onClick={() => handleAdvancedTool('ensemble_create')}>Create Ensemble</Button>
                 <Button variant="secondary" className="w-full" onClick={() => handleAdvancedTool('transfer_learn')}>Transfer Learning</Button>
                 <Button variant="secondary" className="w-full" onClick={() => handleAdvancedTool('explain')}>Explain Prediction</Button>
            </div>
        </Card>
        <Card>
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Training Metrics</h3>
            <div className="h-48">
                {metrics.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics} margin={{top:5,right:20,bottom:5,left:0}}>
                            <Line type="monotone" dataKey="loss" stroke="#FF0090" dot={false} />
                            <Line type="monotone" dataKey="accuracy" stroke="#00FFED" dot={false} />
                            <XAxis dataKey="epoch" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.8)', borderColor: '#334155' }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
      </div>

    </div>
  );
};

export default NeuralView;
