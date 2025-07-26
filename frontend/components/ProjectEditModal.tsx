import React, { useState, useEffect } from 'react';
import { Modal, Button } from './UI';
import { Project } from '../types';

interface Props {
  isOpen: boolean;
  project: Project | null;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}

const ProjectEditModal: React.FC<Props> = ({ isOpen, project, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDesc(project.description);
    }
  }, [project]);

  const handleSave = () => {
    if (!project) return;
    onSave(name.trim(), desc.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
          <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none" rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectEditModal;
