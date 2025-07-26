export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  hives: Hive[];
  files: FileNode[];
  memory: MemoryEntry[];
  settings: HookSettings;
  assistantSettings: AssistantSettings;
  roadmap: Mission[];
  daaAgents: DAAgent[];
  workflows: Workflow[];
  systemServices: SystemService[];
  integrations: Integration[];
  apiKeys: ApiKeyEntry[];
  template?: 'Empty' | 'Web App' | 'Data Analysis' | 'Autonomous';
  consensusTopics: ConsensusTopic[];
  github?: GitHubData;
}

export enum HiveStatus {
  Active = "Active",
  Paused = "Paused",
  Idle = "Idle",
  Processing = "Processing"
}

export interface Hive {
  id: string;
  name: string;
  namespace: string;
  status: HiveStatus;
  agents: AgentType[];
  lastActivity: string;
}

export const ALL_AGENT_TYPES = ["Queen", "Architect", "Coder", "Tester", "Analyst", "Researcher", "Security", "DevOps"] as const;
export type AgentType = typeof ALL_AGENT_TYPES[number];

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  source?: string;
  children?: FileNode[];
  content?: string;
}

export interface MemoryEntry {
  id: string;
  namespace: string;
  query: string;
  summary: string;
  timestamp: string;
}

export interface Hook {
  command: string;
  args: string[];
  alwaysRun: boolean;
  enabled: boolean;
}

export interface HookSettings {
  preTaskHook: Hook;
  preSearchHook: Hook;
  preEditHook: Hook;
  preCommandHook: Hook;
  postEditHook: Hook;
  postTaskHook: Hook;
  postCommandHook: Hook;
  notificationHook: Hook;
  sessionStartHook: Hook;
  sessionEndHook: Hook;
  sessionRestoreHook: Hook;
}

export type View = "dashboard" | "nexus-roadmap" | "ai-head-of-dev" | "workspace" | "memory" | "settings" | "neural" | "tools" | "daa" | "workflows" | "system" | "integrations" | "apikeys" | "assistant-settings" | "admin";

export interface ActivityLogEntry {
    id: number;
    timestamp: string;
    type: 'info' | 'success' | 'error' | 'warning';
    message: string;
}

export interface MCPTool {
    name: string;
    description: string;
    example: string;
}

export interface MCPCategory {
    name: string;
    tools: MCPTool[];
}

export type MissionStage = 'Backlog' | 'Specification' | 'In Progress' | 'Review' | 'Done';

export interface SubTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'complete';
  agent?: AgentType;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  stage: MissionStage;
  subTasks: SubTask[];
  assignedAgentIds: string[];
  githubIssueId?: number;
  githubPRId?: number;
  priority: 'Low' | 'Medium' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  aiInsight?: string;
}

// Dynamic Agent Architecture
export type DAAgentStatus = 'Idle' | 'Active' | 'Scaling' | 'Terminated';
export interface DAAgent {
    id: string;
    type: AgentType;
    status: DAAgentStatus;
    hiveId?: string;
    model: string;
    resources: {
        memory: number; // in MB
        compute: 'low' | 'medium' | 'high';
    };
    capabilities: string[];
}

export interface ConsensusTopic {
    id: string;
    topic: string;
    status: 'active' | 'closed';
    participants: { agentId: string; vote: 'yes' | 'no' | 'abstain' }[];
}


// Workflow Automation
export interface WorkflowStep {
    id: string;
    name: string;
    command: string;
}
export interface Workflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    lastRun: string | null;
}

export interface WorkflowQueueItem {
    id: number;
    workflow_id: string;
    name: string;
    status: string;
    progress: number;
    created_at: string;
}

export interface WorkflowLogEntry {
    id: number;
    queue_id: number;
    message: string;
    created_at: string;
}

// Command Palette
export type CommandType = 'navigation' | 'action' | 'external';
export interface Command {
    id:string;
    name: string;
    description: string;
    type: CommandType;
    icon: React.ReactNode;
    action: () => void;
}

// System Status
export type SystemServiceStatus = 'Operational' | 'Degraded' | 'Outage';
export interface SystemService {
    id: string;
    name: string;
    status: SystemServiceStatus;
    description: string;
}

// Toast Notifications
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

// Integrations
export type IntegrationProvider = 'GitHub' | 'Google Drive' | 'AWS S3' | 'Dropbox';

export interface Integration {
    id: string;
    provider: IntegrationProvider;
    account: string;
    status: 'Connected' | 'Disconnected';
}

// AI Providers
export type ApiProvider = 'Gemini' | 'OpenAI' | 'Claude' | 'OpenRouter' | 'X';

export interface ApiKeyEntry {
    id: string;
    provider: ApiProvider;
    apiKey: string;
    status: 'Connected' | 'Disconnected';
}


// GitHub Integration
export type GitHubBoardStatus = 'Backlog' | 'In Progress' | 'Review' | 'Done';

export interface GitHubIssue {
    id: number;
    title: string;
    author: string;
    status: 'Open' | 'Closed';
    boardStatus: GitHubBoardStatus;
    agentId?: string;
}

export interface GitHubPR {
    id: number;
    title: string;
    author: string;
    status: 'Open' | 'Closed' | 'Merged';
}

export interface GitHubData {
    url: string;
    issues: GitHubIssue[];
    pullRequests: GitHubPR[];
}

// Autonomous Project Initiation
export interface RoadmapMission {
    title: string;
    description: string;
}

export type StrikeTeam = 'scout' | 'assault' | 'juggernaut';

// AI Assistant
export type AssistantStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface Suggestion {
  text: string;
  command: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: React.ReactNode;
  suggestions?: Suggestion[];
}

export interface AssistantSettings {
    provider: ApiProvider;
    model: string;
    language: 'de-DE' | 'en-US' | 'es-ES' | 'fr-FR';
    systemInstruction: string;
    actionConfirmation: boolean;
    enabled: boolean;
}

export interface AssistantAction {
  action: 'CREATE_MISSION_WITH_TEAM' | 'NAVIGATE' | 'SPAWN_HIVE' | 'UNKNOWN';
  parameters: {
    featureName?: string;
    teamSize?: 'small' | 'medium' | 'large';
    viewName?: View;
    hiveName?: string;
    [key: string]: any;
  };
  feedback: string;
  suggestions?: Suggestion[];
}

export interface HoDQueryContext {
  type: 'Mission' | 'Hive' | 'Agent' | 'Workflow';
  id: string;
  name: string;
}