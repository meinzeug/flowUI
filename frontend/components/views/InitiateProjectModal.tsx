
import React, { useState } from 'react';
import { Modal, Button, Card, Loader } from '../UI';
import { RoadmapMission, StrikeTeam, ActivityLogEntry } from '../../types';
import { AgentIcon, NexusIcon, PaperAirplaneIcon } from '../Icons';
import { GoogleGenAI, Type } from "@google/genai";

interface InitiateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInitiate: (name: string, description: string, roadmap: RoadmapMission[], team: StrikeTeam) => void;
    addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void;
}

const StepIndicator: React.FC<{ currentStep: number, totalSteps: number }> = ({ currentStep, totalSteps }) => (
    <div className="flex justify-center mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
            <React.Fragment key={i}>
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${i + 1 <= currentStep ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                        {i + 1}
                    </div>
                </div>
                {i < totalSteps - 1 && <div className={`flex-1 h-1 my-4 mx-2 transition-all duration-300 ${i + 1 < currentStep ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

const stepTitles = ["The Vision", "The Blueprint", "The Assembly", "The Launch"];
const strikeTeams: Record<StrikeTeam, { name: string; description: string; queens: number; agents: number }> = {
    scout: { name: 'Scout Team', description: 'Lean & fast. Ideal for MVPs and small projects.', queens: 1, agents: 4 },
    assault: { name: 'Assault Team', description: 'Balanced growth. The standard for most applications.', queens: 2, agents: 8 },
    juggernaut: { name: 'Juggernaut Fleet', description: 'Enterprise scale. For large, complex systems.', queens: 4, agents: 16 }
};


const InitiateProjectModal: React.FC<InitiateProjectModalProps> = ({ isOpen, onClose, onInitiate, addLog }) => {
    const [step, setStep] = useState(1);
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [roadmap, setRoadmap] = useState<RoadmapMission[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<StrikeTeam>('assault');
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        onClose();
        // Reset state after modal closes
        setTimeout(() => {
            setStep(1);
            setProjectName('');
            setProjectDescription('');
            setRoadmap([]);
            setIsLoading(false);
            setSelectedTeam('assault');
        }, 300);
    };

    const handleGenerateRoadmap = async () => {
        if (!projectDescription) return;
        setIsLoading(true);
        addLog('Engaging Queen agents to generate project roadmap...', 'info');

        try {
            // This is a mocked API call. A real implementation would not need the API key here.
            // The API key MUST be provided via `process.env.API_KEY` in a real backend/serverless function.
            // We simulate this for frontend demonstration purposes.
            if (!process.env.API_KEY) {
                addLog('API_KEY environment variable not set. Using mock data.', 'warning', true);
                // Mock response for environments without an API key
                setTimeout(() => {
                    const mockResponse = {
                        roadmap: [
                            { title: 'User Authentication', description: 'Implement secure user sign-up, login, and session management.' },
                            { title: 'Core Feature: Dog Walker Profiles', description: 'Allow dog walkers to create and manage their profiles.' },
                            { title: 'Booking System', description: 'Enable users to book dog walking sessions with available walkers.' },
                            { title: 'Real-time Walk Tracking', description: 'Implement GPS tracking for ongoing walks viewable on a map.' },
                            { title: 'Payment Integration', description: 'Integrate Stripe or another service for handling payments.' },
                        ]
                    };
                    setRoadmap(mockResponse.roadmap);
                    setIsLoading(false);
                    setStep(2);
                    addLog('Roadmap generated successfully by Queen agents.', 'success');
                }, 2500);
                return;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const schema = {
                type: Type.OBJECT,
                properties: {
                    roadmap: {
                        type: Type.ARRAY,
                        description: 'The generated project roadmap with 5-7 main features or missions.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: 'The title of the mission or epic.' },
                                description: { type: Type.STRING, description: 'A short (1-sentence) description of the mission.' }
                            },
                            required: ['title', 'description']
                        }
                    }
                },
                required: ['roadmap']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on this app idea, generate a high-level project roadmap. App idea: "${projectDescription}"`,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: schema,
                }
            });

            const jsonResponse = JSON.parse(response.text);
            if (jsonResponse.roadmap) {
                setRoadmap(jsonResponse.roadmap);
                setStep(2);
                addLog('Roadmap generated successfully by Queen agents.', 'success');
            } else {
                throw new Error("Invalid response format from AI.");
            }
        } catch (error) {
            console.error("Error generating roadmap:", error);
            addLog('Failed to generate roadmap. Please try again.', 'error', true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLaunch = () => {
        onInitiate(projectName, projectDescription, roadmap, selectedTeam);
        handleClose();
    };


    const renderStepContent = () => {
        switch (step) {
            case 1: // The Vision
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., DogWalker Pro" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Describe Your App Concept</label>
                            <textarea value={projectDescription} onChange={e => setProjectDescription(e.target.value)} rows={5} placeholder="Describe the core purpose and features of the application you want to build. The more detail, the better the AI-generated roadmap will be." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500" />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleGenerateRoadmap} disabled={!projectName || !projectDescription || isLoading}>
                               {isLoading ? <Loader text="Generating..."/> : <>Generate Blueprint <NexusIcon className="w-5 h-5 ml-2" /></>}
                            </Button>
                        </div>
                    </div>
                );
            case 2: // The Blueprint
                return (
                    <div className="space-y-4">
                        <p className="text-slate-400">The Queen agents have generated the following high-level roadmap. Review it before assembling your team.</p>
                        <Card className="max-h-80 overflow-y-auto !p-0">
                            <ul className="divide-y divide-slate-800">
                            {roadmap.map((mission, i) => (
                                <li key={i} className="p-4">
                                    <h4 className="font-bold text-white">{mission.title}</h4>
                                    <p className="text-sm text-slate-400">{mission.description}</p>
                                </li>
                            ))}
                            </ul>
                        </Card>
                         <div className="flex justify-between pt-4">
                            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={() => setStep(3)}>Assemble Team</Button>
                        </div>
                    </div>
                );
            case 3: // The Assembly
                return (
                    <div className="space-y-6">
                        <p className="text-slate-400">Select a pre-configured AI Strike Team. This determines the scale and resources for your project.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {Object.entries(strikeTeams).map(([key, team]) => (
                               <Card key={key} className={`text-center !p-4 hover:-translate-y-1 ${selectedTeam === key ? 'border-cyan-400/80 shadow-cyan' : ''}`} onClick={() => setSelectedTeam(key as StrikeTeam)}>
                                    <h4 className="text-lg font-bold text-white">{team.name}</h4>
                                    <div className="my-4 text-cyan-300 text-3xl font-black">{team.agents}</div>
                                    <p className="text-xs text-slate-400 h-10">{team.description}</p>
                                    <div className="mt-2 text-xs font-mono text-fuchsia-400">{team.queens} <AgentIcon agent="Queen"/></div>
                               </Card>
                           ))}
                        </div>
                         <div className="flex justify-between pt-4">
                            <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                            <Button onClick={() => setStep(4)}>Review & Launch</Button>
                        </div>
                    </div>
                )
            case 4: // The Launch
                 return (
                    <div className="space-y-4">
                        <p className="text-slate-400">Review the final configuration before launching the autonomous project.</p>
                        <Card className="!p-4 bg-slate-800/50 space-y-3">
                            <div><span className="font-bold text-slate-400 w-32 inline-block">Project Name:</span> <span className="text-white">{projectName}</span></div>
                             <div><span className="font-bold text-slate-400 w-32 inline-block">Strike Team:</span> <span className="text-white capitalize">{selectedTeam} ({strikeTeams[selectedTeam].agents} Agents)</span></div>
                        </Card>
                        <h4 className="font-bold text-white pt-2">Generated Roadmap</h4>
                         <Card className="max-h-60 overflow-y-auto !p-0">
                            <ul className="divide-y divide-slate-800">
                            {roadmap.map((mission, i) => (
                                <li key={i} className="p-3 text-sm">
                                    <span className="font-medium text-white">{mission.title}</span>
                                </li>
                            ))}
                            </ul>
                        </Card>
                        <div className="flex justify-between pt-4">
                            <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                            <Button onClick={handleLaunch} className="bg-gradient-to-br from-green-500 to-cyan-500">
                                Launch Project <PaperAirplaneIcon className="w-5 h-5 ml-2"/>
                            </Button>
                        </div>
                    </div>
                )
            default: return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Initiate Autonomous Project">
             <StepIndicator currentStep={step} totalSteps={4} />
             <h3 className="text-2xl font-bold text-center text-white mb-2">{stepTitles[step - 1]}</h3>
             <div className="p-4 min-h-[300px]">
                {renderStepContent()}
            </div>
        </Modal>
    );
};

export default InitiateProjectModal;
