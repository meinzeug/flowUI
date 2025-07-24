import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap, addEdge, ReactFlowProvider, Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

export interface GraphData {
  nodes: any[];
  edges: Edge[];
}

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 150, y: 0 }, data: { label: 'Node 2' } }
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

export const FlowEditor: React.FC<{ onSave: (data: GraphData) => void; initial?: GraphData }> = ({ onSave, initial }) => {
  const [nodes, setNodes] = useState(initial?.nodes || initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initial?.edges || initialEdges);

  useEffect(() => {
    if (initial) {
      setNodes(initial.nodes);
      setEdges(initial.edges);
    }
  }, [initial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const onNodesChange = useCallback((nds: any) => setNodes(nds), []);
  const onEdgesChange = useCallback((eds: any) => setEdges(eds), []);
  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge(c, eds)), []);

  const handleSave = () => {
    onSave({ nodes, edges });
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView>
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
      <button onClick={handleSave} className="mt-2 px-3 py-1 bg-cyan-600 text-white rounded">Save Graph</button>
    </div>
  );
};

export default FlowEditor;
