import React from 'react';
import { Project } from '../types';
import { Card } from './UI';

interface Props {
  projects: Project[];
  onSelect: (id: string) => void;
}

const ProjectList: React.FC<Props> = ({ projects, onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projects.map(p => (
      <Card key={p.id} onClick={() => onSelect(p.id)} className="hover:shadow-cyan-lg hover:-translate-y-1">
        <h3 className="text-xl font-bold text-cyan-400 truncate">{p.name}</h3>
        <p className="text-slate-400 mt-2 h-12 overflow-hidden">{p.description}</p>
        <div className="mt-4 text-sm text-slate-500 flex justify-between">
          <span>{p.hives.length} Hives</span>
          <span className="bg-fuchsia-500/10 text-fuchsia-400 px-2 py-0.5 rounded-full text-xs font-semibold">
            {p.template || 'Custom'}
          </span>
        </div>
      </Card>
    ))}
  </div>
);

export default ProjectList;
