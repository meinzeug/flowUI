
import React, { useState } from 'react';
import { MCP_TOOLS } from '../../constants';
import { Card } from '../UI';
import { ToolsIcon, ChevronDownIcon } from '../Icons';

const MCPToolsView: React.FC = () => {
    const [openCategory, setOpenCategory] = useState<string | null>(MCP_TOOLS[0].name);

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">MCP Tools Browser</h2>
                <p className="text-slate-400 mt-1">Explore the 87 advanced tools available in the Master Control Program.</p>
            </div>

            <div className="space-y-4">
                {MCP_TOOLS.map(category => (
                    <div key={category.name}>
                        <button 
                            className="w-full text-left bg-slate-800/50 p-4 rounded-lg flex justify-between items-center"
                            onClick={() => setOpenCategory(openCategory === category.name ? null : category.name)}
                        >
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <ToolsIcon className="w-6 h-6 text-cyan-400" />
                                {category.name}
                            </h3>
                            <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${openCategory === category.name ? 'rotate-180' : ''}`} />
                        </button>

                        {openCategory === category.name && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                {category.tools.map(tool => (
                                    <Card key={tool.name} className="!p-4">
                                        <h4 className="font-bold text-cyan-400 font-mono">{tool.name}</h4>
                                        <p className="text-sm text-slate-300 mt-2 h-16">{tool.description}</p>
                                        <code className="text-xs text-fuchsia-400 bg-slate-800/50 p-2 rounded mt-2 block whitespace-nowrap overflow-x-auto">
                                            {tool.example}
                                        </code>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MCPToolsView;
