import React, { useState } from 'react';
import { Modal, Button } from './UI';

export interface Template {
  name: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  templates: Template[];
  onCreate: (name: string, desc: string, template: string) => void;
  onClose: () => void;
}

const ProjectCreateModal: React.FC<Props> = ({ isOpen, templates, onCreate, onClose }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [template, setTemplate] = useState(templates[0]?.name || '');

  const handle = () => {
    if (name.trim()) {
      onCreate(name.trim(), desc.trim(), template);
      setName('');
      setDesc('');
      setTemplate(templates[0]?.name || '');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
          <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Project Template</label>
          <div className="space-y-3">
            {templates.map(t => (
              <div key={t.name} onClick={() => setTemplate(t.name)} className={`p-4 border rounded-lg cursor-pointer transition-all ${template === t.name ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600'}`}> 
                <h4 className="font-bold text-white">{t.name}</h4>
                <p className="text-sm text-slate-400">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handle}>Create Project</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectCreateModal;
