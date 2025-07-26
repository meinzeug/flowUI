import React, { useEffect, useState } from 'react';
import { WorkflowQueueItem } from '../types';
import { Card } from './UI';
import { wsService } from '../WebSocketService';

const WorkflowQueue: React.FC = () => {
  const [queue, setQueue] = useState<WorkflowQueueItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/workflows/queue');
      if (res.ok) setQueue(await res.json());
    };
    load();
    const interval = setInterval(load, 5000);
    wsService.subscribe('workflow');
    wsService.on('workflowProgress', 'workflow', (payload) => {
      setQueue(q => q.map(item => item.id === payload.queueId ? { ...item, status: payload.status, progress: payload.progress } : item));
    });
    return () => {
      clearInterval(interval);
      wsService.unsubscribe('workflow');
    };
  }, []);

  if (queue.length === 0) return null;

  return (
    <Card>
      <h3 className="text-lg font-bold text-white mb-2">Running Workflows</h3>
      <div className="space-y-2">
        {queue.map(item => (
          <div key={item.id} className="space-y-1">
            <div className="flex justify-between text-sm text-slate-300">
              <span>{item.name}</span>
              <span>{Math.round(item.progress)}%</span>
            </div>
            <div className="bg-slate-700 rounded h-2 overflow-hidden">
              <div className="bg-cyan-500 h-full" style={{ width: `${item.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WorkflowQueue;
