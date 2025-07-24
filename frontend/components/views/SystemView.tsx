
import React from 'react';
import { Project, ActivityLogEntry, SystemService, SystemServiceStatus } from '../../types';
import { Card, Button } from '../UI';

const ServiceStatusIndicator: React.FC<{ status: SystemServiceStatus }> = ({ status }) => {
  const statusConfig = {
    'Operational': { color: 'bg-green-500', text: 'Operational' },
    'Degraded': { color: 'bg-yellow-500', text: 'Degraded' },
    'Outage': { color: 'bg-red-500', text: 'Outage' },
  };
  const config = statusConfig[status];
  const pulseClass = status !== 'Operational' ? 'animate-pulse' : '';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color} ${pulseClass}`}></div>
      <span className="text-sm font-medium text-white">{config.text}</span>
    </div>
  );
};


const SystemView: React.FC<{ project: Project; addLog: (message: string, type?: ActivityLogEntry['type'], showToast?: boolean) => void; }> = ({ project, addLog }) => {
    
    const handleHealthCheck = () => {
        addLog("Running system-wide health check...", 'info');
        setTimeout(() => {
            const hasIssues = project.systemServices.some(s => s.status !== 'Operational');
            if (hasIssues) {
                addLog("Health check complete. Found 1 degraded service.", 'warning', true);
            } else {
                addLog("Health check complete. All systems operational.", 'success', true);
            }
        }, 1500);
    };

    const handleDiagnosticRun = () => {
        addLog("Running diagnostics on all services...", 'info');
        setTimeout(() => {
            addLog("Diagnostics complete. No critical issues found.", 'success', true);
        }, 2000);
    };

    const overallStatus = project.systemServices.every(s => s.status === 'Operational') 
        ? 'All Systems Operational' 
        : project.systemServices.some(s => s.status === 'Outage')
        ? 'Major System Outage'
        : 'Degraded Performance';
    
    const overallStatusColor = overallStatus === 'All Systems Operational' 
        ? 'text-green-400' 
        : overallStatus === 'Major System Outage'
        ? 'text-red-400'
        : 'text-yellow-400';

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-white">System Status</h2>
                    <p className="text-slate-400 mt-1">Monitor the health of all Claude-Flow components.</p>
                </div>
                 <div className="flex gap-4">
                    <Button variant="secondary" onClick={handleDiagnosticRun}>Run Diagnostics</Button>
                    <Button variant="primary" onClick={handleHealthCheck}>Run Health Check</Button>
                </div>
            </div>

            <Card>
                <div className="text-center py-4">
                    <h3 className={`text-2xl font-bold ${overallStatusColor}`}>{overallStatus}</h3>
                    <p className="text-slate-400 mt-1">Last check: {new Date().toLocaleTimeString()}</p>
                </div>
            </Card>

             <Card>
                <h3 className="text-xl font-bold text-white mb-4">System Management</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="secondary" onClick={() => addLog("Running command: c-f sys backup_create", 'info', true)}>Create Backup</Button>
                    <Button variant="secondary" onClick={() => addLog("Running command: c-f sys restore_system", 'info', true)}>Restore System</Button>
                    <Button variant="secondary" onClick={() => addLog("Running command: c-f config manage", 'info', true)}>Manage Config</Button>
                    <Button variant="secondary" onClick={() => addLog("Running command: c-f log analysis", 'info', true)}>Analyze Logs</Button>
                </div>
            </Card>

            <div className="space-y-4">
                {project.systemServices.map((service: SystemService) => (
                    <Card key={service.id} className="!p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-bold text-white">{service.name}</h4>
                                <p className="text-sm text-slate-400">{service.description}</p>
                            </div>
                            <ServiceStatusIndicator status={service.status} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SystemView;
