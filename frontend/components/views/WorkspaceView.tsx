
import React, { useState } from 'react';
import { Project, FileNode, ActivityLogEntry } from '../../types';
import { Card, Button } from '../UI';
import { FolderIcon, FileIcon, ChevronDownIcon, GitHubIcon, GoogleDriveIcon, LocalStorageIcon } from '../Icons';

const CodeEditor: React.FC<{ content: string }> = ({ content }) => (
    <textarea
        readOnly
        value={content}
        className="w-full h-full bg-slate-900 font-mono text-sm p-4 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg"
    />
);

const sourceIcons: { [key: string]: React.FC<{ className?: string }> } = {
    'local': LocalStorageIcon,
    'google-drive': GoogleDriveIcon,
    'github': GitHubIcon
};

const FileTree: React.FC<{ 
    node: FileNode; 
    onSelectFile: (file: FileNode) => void;
    selectedFileId: string | null;
    level?: number;
}> = ({ node, onSelectFile, selectedFileId, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(true);

    const isSourceRoot = level === 0;
    const Icon = isSourceRoot 
        ? (sourceIcons[node.source || ''] || FolderIcon) 
        : node.type === 'directory' ? FolderIcon : FileIcon;
    
    const iconColor = isSourceRoot ? 'text-white' : 'text-cyan-400';

    if (node.type === 'directory') {
        return (
            <div className={level > 0 ? "ml-4" : ""}>
                <div 
                    className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-md hover:bg-slate-700/50"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                    <Icon className={`w-5 h-5 ${node.type === 'directory' && !isSourceRoot ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span className="font-medium text-white">{node.name}</span>
                </div>
                {isOpen && node.children && (
                    <div className="pl-4 border-l-2 border-slate-700">
                        {node.children.map(child => (
                            <FileTree key={child.id} node={child} onSelectFile={onSelectFile} selectedFileId={selectedFileId} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div 
            className={`flex items-center gap-2 cursor-pointer py-1 px-2 rounded-md ml-4 hover:bg-slate-700/50 ${selectedFileId === node.id ? 'bg-cyan-400/10' : ''}`}
            onClick={() => onSelectFile(node)}
        >
            <div className="w-4 h-4"></div> {/* Spacer */}
            <FileIcon className="w-5 h-5 text-slate-400" />
            <span className={selectedFileId === node.id ? 'text-cyan-400' : 'text-slate-300'}>{node.name}</span>
        </div>
    );
};

const WorkspaceView: React.FC<{ project: Project; addLog: (message: string, type?: ActivityLogEntry['type']) => void; }> = ({ project, addLog }) => {
    const findFirstFile = (nodes: FileNode[]): FileNode | null => {
        for (const node of nodes) {
            if (node.type === 'file') {
                return node;
            }
            if (node.type === 'directory' && node.children) {
                const found = findFirstFile(node.children);
                if (found) return found;
            }
        }
        return null;
    };

    const [selectedFile, setSelectedFile] = useState<FileNode | null>(findFirstFile(project.files));

    const handleDownload = () => {
        addLog(`Preparing project download for "${project.name}"...`, 'info');
        setTimeout(() => {
            addLog(`Project "${project.name}.zip" downloaded successfully.`, 'success');
        }, 1500);
    }

    return (
        <div className="h-[calc(100vh-14rem)] flex flex-col md:flex-row gap-6 animate-fade-in-up">
            <Card className="w-full md:w-1/3 lg:w-1/4 flex flex-col !p-4">
                <div className="flex justify-between items-center p-2 mb-2">
                    <h3 className="text-xl font-bold text-white">File Explorer</h3>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                    {project.files.map(node => (
                        <FileTree key={node.id} node={node} onSelectFile={setSelectedFile} selectedFileId={selectedFile?.id || null} />
                    ))}
                </div>
            </Card>
            <Card className="flex-1 flex flex-col !p-4">
                <div className="flex justify-between items-center p-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{selectedFile?.name || "Select a file"}</h3>
                    <Button variant="secondary" onClick={handleDownload}>Download Project</Button>
                </div>
                <div className="flex-1 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    {selectedFile && selectedFile.type === 'file' ? (
                        <CodeEditor content={selectedFile.content || ''} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>{selectedFile ? 'Select a file to view its content.' : 'No file selected.'}</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WorkspaceView;
