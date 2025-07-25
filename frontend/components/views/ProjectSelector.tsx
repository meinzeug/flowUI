
import React, { useState } from 'react';
import { Project } from '../../types';
import { Card, Button, Modal } from '../UI';
import { LogoIcon, PlusIcon } from '../Icons';

type TemplateType = 'Empty' | 'Web App' | 'Data Analysis';

const templates: { name: TemplateType; description: string }[] = [
    { name: 'Empty', description: 'A blank project, perfect for starting from scratch.' },
    { name: 'Web App', description: 'Pre-configured with Coder and Architect agents for frontend work.' },
    { name: 'Data Analysis', description: 'Starts with Analyst and Researcher agents for data tasks.' },
];

interface ProjectSelectorProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string, description: string, template: TemplateType) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects, onSelectProject, onCreateProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('Empty');

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectDesc.trim(), selectedTemplate);
      setNewProjectName('');
      setNewProjectDesc('');
      setSelectedTemplate('Empty');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center mb-12 animate-fade-in-up">
        <LogoIcon className="h-24 w-24 mx-auto mb-4" />
        <h1 className="text-5xl font-black">Flow Weaver</h1>
        <p className="text-slate-400 mt-2 text-lg">Your AI-Powered Development Orchestration Platform</p>
      </div>

      <div className="w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Select a Project</h2>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                <PlusIcon className="w-5 h-5" />
                New Project
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-cyan-lg hover:-translate-y-1" onClick={() => onSelectProject(project.id)}>
              <h3 className="text-xl font-bold text-cyan-400 truncate">{project.name}</h3>
              <p className="text-slate-400 mt-2 h-12 overflow-hidden">{project.description}</p>
              <div className="mt-4 text-sm text-slate-500 flex justify-between">
                <span>{project.hives.length} Hives</span>
                <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded-full text-xs font-semibold">{project.template || 'Custom'}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <div className="space-y-6">
            <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input
                    type="text"
                    id="projectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="e.g., My Awesome App"
                />
            </div>
            <div>
                <label htmlFor="projectDesc" className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                <textarea
                    id="projectDesc"
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Describe your project's goal"
                />
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-3">Project Template</label>
                 <div className="space-y-3">
                    {templates.map(template => (
                        <div key={template.name} onClick={() => setSelectedTemplate(template.name)} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedTemplate === template.name ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                            <h4 className="font-bold text-white">{template.name}</h4>
                            <p className="text-sm text-slate-400">{template.description}</p>
                        </div>
                    ))}
                 </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreate}>Create Project</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectSelector;