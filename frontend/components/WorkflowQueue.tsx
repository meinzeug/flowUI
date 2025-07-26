import React, { useEffect, useState } from 'react';
import { WorkflowQueueItem, WorkflowLogEntry } from '../types';
import { Card } from './UI';
import { wsService } from '../WebSocketService';

const WorkflowQueue: React.FC = () => {
  const [queue, setQueue] = useState<WorkflowQueueItem[]>([]);
  const [logs, setLogs] = useState<Record<number, WorkflowLogEntry[]>>({});
  const [openId, setOpenId] = useState<number | null>(null);

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
    wsService.on('workflowLog', 'workflow', (payload) => {
      setLogs(l => ({
        ...l,
        [payload.queueId]: [...(l[payload.queueId] || []), { id: Date.now(), queue_id: payload.queueId, message: payload.message, created_at: new Date().toISOString() }]
      }));
    });
    return () => {
      clearInterval(interval);
      wsService.unsubscribe('workflow');
    };
  }, []);

  if (queue.length === 0) return null;

  const colorForStatus = (status: string) => {
    switch (status) {
      case 'finished':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-cyan-500';
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-white mb-2">Running Workflows</h3>
      <div className="space-y-2">
        {queue.map(item => (
          <div key={item.id} className="space-y-1">
            <div className="flex justify-between text-sm text-slate-300">
              <span>{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="capitalize" data-testid="status-label">{item.status}</span>
                <span>{Math.round(item.progress)}%</span>
                {item.status === 'running' || item.status === 'queued' ? (
                  <button
                    className="text-red-400 hover:text-red-300"
                    onClick={async () => {
                      await fetch(`/api/workflows/queue/${item.id}/cancel`, { method: 'POST' });
                    }}
                  >
                    Stop
                  </button>
                ) : null}
                <button
                  className="text-cyan-400 hover:text-cyan-300"
                  onClick={async () => {
                    if (openId === item.id) { setOpenId(null); return; }
                    setOpenId(item.id);
                    if (!logs[item.id]) {
                      const res = await fetch(`/api/workflows/queue/${item.id}/logs`);
                      if (res.ok) setLogs(l => ({ ...l, [item.id]: await res.json() }));
                    }
                  }}
                >
                  Logs
                </button>
              </div>
            </div>
            <div className="bg-slate-700 rounded h-2 overflow-hidden">
              <div className={`h-full ${colorForStatus(item.status)}`} style={{ width: `${item.progress}%` }}></div>
            </div>
            {openId === item.id && logs[item.id] ? (
              <div className="bg-slate-800 rounded p-2 text-xs text-slate-300 font-mono max-h-40 overflow-y-auto">
                {logs[item.id].map(log => <div key={log.id}>{log.message}</div>)}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default WorkflowQueue;
