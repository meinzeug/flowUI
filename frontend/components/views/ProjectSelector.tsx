
import React, { useState } from 'react';
import { Project } from '../../types';
import { Button } from '../UI';
import { LogoIcon, PlusIcon } from '../Icons';
import { useAuth } from '../../hooks/useAuth';
import ProjectList from '../ProjectList';
import ProjectCreateModal from '../ProjectCreateModal';

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
  onDeleteProject: (id: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ projects, onSelectProject, onCreateProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const handleCreate = (name: string, desc: string, template: TemplateType) => {
    onCreateProject(name, desc, template);
  };

  return (
    <div className="min-h-screen bg-[#050608] flex flex-col items-center justify-center p-8 text-white">
      <div className="absolute top-4 right-4 text-sm">
        <button onClick={() => setMenuOpen(v => !v)} className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
          {user?.username}
        </button>
        {menuOpen && (
          <div className="mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl">
            <button className="block px-4 py-2 w-full text-left hover:bg-slate-700" onClick={logout}>Logout</button>
          </div>
        )}
      </div>
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
        
        <ProjectList projects={projects} onSelect={onSelectProject} onDelete={onDeleteProject} />
      </div>

      <ProjectCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
        templates={templates}
      />
    </div>
  );
};

export default ProjectSelector;