



import React, { useState } from 'react';
import { DashboardIcon, WorkspaceIcon, MemoryIcon, LogoIcon, LogoutIcon, BrainIcon, ToolsIcon, DAAIcon, WorkflowIcon, SystemIcon, IntegrationsIcon, NexusIcon, KeyIcon, ChevronDownIcon, RoadmapIcon, HeadOfDevIcon } from './Icons';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onExitProject: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSubItem?: boolean;
}> = ({ icon, label, isActive, onClick, isSubItem = false }) => (
  <li
    onClick={onClick}
    className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
      isActive
        ? 'bg-cyan-400/10 text-cyan-400'
        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    } ${isSubItem ? 'pl-5' : ''}`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onExitProject }) => {
  const [isNexusOpen, setIsNexusOpen] = useState(true);

  const nexusViews: View[] = ['nexus-roadmap', 'ai-head-of-dev'];

  return (
    <div className="w-64 bg-slate-900/70 backdrop-blur-xl border-r border-slate-800 flex flex-col p-4">
      <div className="flex items-center gap-3 px-3 mb-10">
        <LogoIcon className="h-10 w-10" />
        <h1 className="text-xl font-black text-white">Claude-Flow</h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          <NavItem
            icon={<DashboardIcon className="h-6 w-6" />}
            label="Dashboard"
            isActive={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          
          <li className="space-y-1">
              <button
                  onClick={() => setIsNexusOpen(!isNexusOpen)}
                  className={`flex items-center justify-between w-full p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      nexusViews.includes(currentView) ? 'text-cyan-400' : 'text-slate-400'
                  } hover:bg-slate-700/50 hover:text-white`}
              >
                  <div className="flex items-center space-x-4">
                      <NexusIcon className="h-6 w-6" />
                      <span className="font-semibold">Nexus</span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${isNexusOpen ? '' : '-rotate-90'}`} />
              </button>
              {isNexusOpen && (
                  <ul className="pl-5 space-y-1 pt-1">
                      <NavItem
                          icon={<RoadmapIcon className="h-5 w-5" />}
                          label="Roadmap"
                          isActive={currentView === 'nexus-roadmap'}
                          onClick={() => setCurrentView('nexus-roadmap')}
                          isSubItem
                      />
                      <NavItem
                          icon={<HeadOfDevIcon className="h-5 w-5" />}
                          label="AI Head of Dev"
                          isActive={currentView === 'ai-head-of-dev'}
                          onClick={() => setCurrentView('ai-head-of-dev')}
                          isSubItem
                      />
                  </ul>
              )}
          </li>

          <NavItem
            icon={<WorkspaceIcon className="h-6 w-6" />}
            label="Workspace"
            isActive={currentView === 'workspace'}
            onClick={() => setCurrentView('workspace')}
          />
          <NavItem
            icon={<MemoryIcon className="h-6 w-6" />}
            label="Memory"
            isActive={currentView === 'memory'}
            onClick={() => setCurrentView('memory')}
          />
           <NavItem
            icon={<DAAIcon className="h-6 w-6" />}
            label="DAA"
            isActive={currentView === 'daa'}
            onClick={() => setCurrentView('daa')}
          />
           <NavItem
            icon={<WorkflowIcon className="h-6 w-6" />}
            label="Workflows"
            isActive={currentView === 'workflows'}
            onClick={() => setCurrentView('workflows')}
          />
           <NavItem
            icon={<IntegrationsIcon className="h-6 w-6" />}
            label="Integrations"
            isActive={currentView === 'integrations'}
            onClick={() => setCurrentView('integrations')}
          />
           <NavItem
            icon={<KeyIcon className="h-6 w-6" />}
            label="API Keys"
            isActive={currentView === 'apikeys'}
            onClick={() => setCurrentView('apikeys')}
          />
          <NavItem
            icon={<SystemIcon className="h-6 w-6" />}
            label="System"
            isActive={currentView === 'system'}
            onClick={() => setCurrentView('system')}
          />
          <NavItem
            icon={<BrainIcon className="h-6 w-6" />}
            label="Neural"
            isActive={currentView === 'neural'}
            onClick={() => setCurrentView('neural')}
          />
          <NavItem
            icon={<ToolsIcon className="h-6 w-6" />}
            label="MCP Tools"
            isActive={currentView === 'tools'}
            onClick={() => setCurrentView('tools')}
          />
        </ul>
      </nav>

      <div className="mt-auto">
        <NavItem
          icon={<LogoutIcon className="h-6 w-6" />}
          label="Exit Project"
          isActive={false}
          onClick={onExitProject}
        />
      </div>
    </div>
  );
};

export default Sidebar;