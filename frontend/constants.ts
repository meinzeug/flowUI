import { Project, HiveStatus, HookSettings, MCPCategory, DAAgent, Workflow, WorkflowStep, AgentType, SystemService, Integration, IntegrationProvider, ConsensusTopic, Mission, SubTask, GitHubData, ApiKeyEntry, ApiProvider, AssistantSettings } from './types';

const DEFAULT_SETTINGS: HookSettings = {
    preTaskHook: { command: "npx", args: ["claude-flow", "hooks", "pre-task"], alwaysRun: false, enabled: true },
    preSearchHook: { command: "npx", args: ["claude-flow", "hooks", "pre-search"], alwaysRun: true, enabled: true },
    preEditHook: { command: "npx", args: ["claude-flow", "hooks", "pre-edit", "--file", "{file}", "--format", "true"], alwaysRun: true, enabled: true },
    preCommandHook: { command: "npx", args: ["claude-flow", "hooks", "pre-command"], alwaysRun: false, enabled: false },
    postEditHook: { command: "npx", args: ["claude-flow", "hooks", "post-edit", "--format"], alwaysRun: true, enabled: true },
    postTaskHook: { command: "npx", args: ["claude-flow", "hooks", "post-task", "--train-neural"], alwaysRun: true, enabled: false },
    postCommandHook: { command: "npx", args: ["claude-flow", "hooks", "post-command"], alwaysRun: false, enabled: true },
    notificationHook: { command: "npx", args: ["claude-flow", "hooks", "notification"], alwaysRun: true, enabled: true },
    sessionStartHook: { command: "npx", args: ["claude-flow", "hooks", "session-start"], alwaysRun: true, enabled: true },
    sessionEndHook: { command: "npx", args: ["claude-flow", "hooks", "session-end", "--generate-summary", "true"], alwaysRun: true, enabled: true },
    sessionRestoreHook: { command: "npx", args: ["claude-flow", "hooks", "session-restore"], alwaysRun: true, enabled: false },
};

export const DEFAULT_ASSISTANT_SETTINGS: AssistantSettings = {
    provider: 'OpenRouter',
    model: 'qwen/qwen3-coder:free',
    language: 'de-DE',
    systemInstruction: `You are an integrated AI assistant for a development orchestration platform called Claude-Flow. Your job is to understand user commands and translate them into a specific JSON format representing an action to be performed in the application.

                    Available actions are:
                    - CREATE_MISSION_WITH_TEAM: Creates a new mission and assigns a team of AI agents. Requires 'featureName' (string) and 'teamSize' ('small', 'medium', or 'large').
                    - NAVIGATE: Navigates to a different view in the app. Requires 'viewName' (one of 'dashboard', 'nexus-roadmap', 'ai-head-of-dev', 'workspace', 'memory', 'daa', 'workflows', 'system', 'integrations', 'apikeys', 'settings', 'assistant-settings').
                    - SPAWN_HIVE: Creates a new hive-mind session. Requires a 'hiveName' (string).
                    - UNKNOWN: If the command cannot be mapped to an action.

                    For every command, you must also provide a short, conversational 'feedback' message confirming what you are about to do.
                    You can also provide a list of 'suggestions' for follow-up actions. Each suggestion has 'text' (for the button) and 'command' (the command to execute).

                    Example 1:
                    User: "erstelle eine neue funktion für ein bezahlsystem und setze ein mittleres entwicklerteam darauf an"
                    AI: { "action": "CREATE_MISSION_WITH_TEAM", "parameters": { "featureName": "Bezahlsystem", "teamSize": "medium" }, "feedback": "Okay, ich richte eine neue Mission für das Bezahlsystem mit einem mittelgroßen Team ein.", "suggestions": [{ "text": "Zeige mir das Nexus Board", "command": "gehe zum nexus board" }, { "text": "Erstelle einen weiteren Task", "command": "erstelle einen weiteren task" }] }

                    Example 2:
                    User: "show me the DAA dashboard"
                    AI: { "action": "NAVIGATE", "parameters": { "viewName": "daa" }, "feedback": "Navigating to the DAA view.", "suggestions": [{ "text": "Create a new agent", "command": "create a new agent" }] }
                    
                    Example 3:
                    User: "how is the weather"
                    AI: { "action": "UNKNOWN", "parameters": {}, "feedback": "Sorry, I can't check the weather. I can only help you manage your project." }
                    `,
    actionConfirmation: false,
    enabled: true,
};

export const HEAD_OF_DEVELOPMENT_SYSTEM_PROMPT = `You are the AI Head of Development (HoD) for the Claude-Flow platform. You are interfacing with the Chief Technology Officer (CTO). Your role is to provide strategic oversight, report on project status, and translate high-level directives from the CTO into actionable plans for your team of AI "Queen" agents.

You will be given the entire project's state as a JSON object in the prompt. Your analysis and reports MUST be based on this data. You cannot make up information.

Always structure your responses clearly. Use markdown for formatting. Start with a brief, high-level summary, then use sections like:
- ## Project Status
- ## Current Focus
- ## Risk Assessment
- ## Strategic Recommendations
- ## Action Plan

When asked to perform an action (e.g., "create a new feature"), you don't execute the code directly. Instead, you formulate a high-level plan and confirm with the CTO. For example, you would suggest creating a new mission for the roadmap, which the Queens will then pick up.

Keep your tone professional, concise, and data-driven. Always address the user as "CTO". Your goal is to be a trusted, intelligent partner in managing the development lifecycle.

Example Query: "CTO: How is the authentication feature coming along?"
Example Response based on project JSON:
"CTO, here is the status of the 'Implement User Authentication' mission.

## Project Status
The mission is currently in the 'In Progress' stage. Progress is at 25% with 1 of 4 sub-tasks completed.

## Current Focus
The Coder agent is actively working on building the secure login/registration API endpoints. The Security agent is on standby for the next task: implementing JWT for session management.

## Risk Assessment
The overall risk for this mission is rated 'Medium'. A potential bottleneck is the dependency on the Security agent, but their current status is 'Idle', so no immediate delays are foreseen.

## Strategic Recommendations
I recommend we prioritize the frontend forms next to allow for parallel testing once the API endpoints are ready.

## Action Plan
1.  Continue monitoring Coder agent's progress on API endpoints.
2.  Allocate frontend task to a Coder agent once the current sub-task is complete.
3.  Queue JWT task for the Security agent.

Let me know if you would like to adjust these priorities."
`;

export const MOCK_API_KEYS: ApiKeyEntry[] = [
    { id: 'api-gemini', provider: 'Gemini', apiKey: 'via process.env.API_KEY', status: 'Connected' },
    { id: 'api-openai', provider: 'OpenAI', apiKey: '', status: 'Disconnected' },
    { id: 'api-claude', provider: 'Claude', apiKey: '', status: 'Disconnected' },
    { id: 'api-openrouter', provider: 'OpenRouter', apiKey: '', status: 'Disconnected' },
    { id: 'api-x', provider: 'X', apiKey: '', status: 'Disconnected' },
];

export const AVAILABLE_MODELS: Record<ApiProvider, string[]> = {
    'Gemini': ['gemini-2.5-flash'],
    'OpenAI': ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    'Claude': ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    'OpenRouter': ['openrouter/auto', 'anthropic/claude-3-opus', 'google/gemini-flash-1.5', 'qwen/qwen3-coder:free'],
    'X': ['grok-1']
};

export const MOCK_ROADMAP: Mission[] = [
    {
        id: 'mission-auth',
        title: 'Implement User Authentication',
        description: 'End-to-end user authentication flow including registration, login, and password reset.',
        stage: 'In Progress',
        priority: 'High',
        risk: 'Medium',
        assignedAgentIds: ['daa-coder-1', 'daa-sec-1', 'daa-arch-1'],
        githubIssueId: 55,
        subTasks: [
            { id: 'sub-1', description: 'Design database schema for users', status: 'complete', agent: 'Architect' },
            { id: 'sub-2', description: 'Build secure login/registration API endpoints', status: 'in_progress', agent: 'Coder' },
            { id: 'sub-3', description: 'Implement JWT for session management', status: 'pending', agent: 'Security' },
            { id: 'sub-4', description: 'Create frontend login and registration forms', status: 'pending', agent: 'Coder' },
        ],
    },
    {
        id: 'mission-2fa',
        title: 'Add 2FA Support',
        description: 'Enhance security by adding two-factor authentication for all users.',
        stage: 'Specification',
        priority: 'Medium',
        risk: 'Low',
        assignedAgentIds: ['daa-arch-1', 'daa-sec-1'],
        githubIssueId: 52,
        subTasks: [
            { id: 'sub-5', description: 'Evaluate TOTP libraries', status: 'pending', agent: 'Researcher' },
            { id: 'sub-6', description: 'Design user flow for 2FA setup', status: 'pending', agent: 'Architect' },
        ],
    },
    {
        id: 'mission-profile',
        title: 'Develop User Profile Page',
        description: 'Allow users to view and edit their profile information.',
        stage: 'Backlog',
        priority: 'Medium',
        risk: 'Low',
        assignedAgentIds: [],
        githubIssueId: 56,
        subTasks: [],
    },
    {
        id: 'mission-db-leak',
        title: 'Fix Database Connection Leak',
        description: 'Patch a critical bug causing DB connection leaks under heavy load.',
        stage: 'Done',
        priority: 'High',
        risk: 'High',
        assignedAgentIds: ['daa-devops-1', 'daa-coder-1'],
        githubIssueId: 49,
        githubPRId: 100,
        subTasks: [
            { id: 'sub-7', description: 'Analyze connection pool logs', status: 'complete', agent: 'DevOps' },
            { id: 'sub-8', description: 'Implement fix in database service layer', status: 'complete', agent: 'Coder' },
            { id: 'sub-9', description: 'Deploy patch to production', status: 'complete', agent: 'DevOps' },
        ],
    }
];


const MOCK_DAA_AGENTS: DAAgent[] = [
    { id: 'daa-coder-1', type: 'Coder', status: 'Active', hiveId: 'session-auth-123', model: 'Gemini/gemini-2.5-flash', resources: { memory: 2048, compute: 'high' }, capabilities: ['javascript', 'typescript', 'react'] },
    { id: 'daa-sec-1', type: 'Security', status: 'Active', hiveId: 'session-auth-123', model: 'Gemini/gemini-2.5-flash', resources: { memory: 1024, compute: 'medium' }, capabilities: ['jwt', 'oauth', 'pentesting'] },
    { id: 'daa-arch-1', type: 'Architect', status: 'Idle', hiveId: 'session-users-456', model: 'Claude/claude-3-opus-20240229', resources: { memory: 4096, compute: 'high' }, capabilities: ['microservices', 'system-design'] },
    { id: 'daa-res-1', type: 'Researcher', status: 'Idle', model: 'OpenAI/gpt-4-turbo', resources: { memory: 2048, compute: 'medium' }, capabilities: ['data-analysis', 'web-scraping'] },
    { id: 'daa-devops-1', type: 'DevOps', status: 'Terminated', model: 'Gemini/gemini-2.5-flash', resources: { memory: 1024, compute: 'medium' }, capabilities: ['docker', 'kubernetes', 'ci/cd'] },
];

const MOCK_CONSENSUS_TOPICS: ConsensusTopic[] = [
    {
        id: 'con-1',
        topic: 'Should we adopt GraphQL for the new API?',
        status: 'active',
        participants: [
            { agentId: 'daa-coder-1', vote: 'yes' },
            { agentId: 'daa-arch-1', vote: 'yes' },
            { agentId: 'daa-sec-1', vote: 'abstain' },
        ]
    }
];


const MOCK_WORKFLOWS: Workflow[] = [
    {
        id: 'wf-1', name: 'CI/CD Pipeline', description: 'Standard pipeline for testing, building, and deploying.',
        steps: [
            { id: 'step-1', name: 'Run Tests', command: 'npx jest' },
            { id: 'step-2', name: 'Build Project', command: 'npx webpack --mode production' },
            { id: 'step-3', name: 'Deploy to Staging', command: 'npx c-f deploy --env staging' },
        ],
        lastRun: '2024-07-28T12:00:00Z',
    },
    {
        id: 'wf-2', name: 'Code Quality Check', description: 'Runs linter, formatter, and security scan.',
        steps: [
            { id: 'step-4', name: 'Lint Code', command: 'npx eslint src/' },
            { id: 'step-5', name: 'Format Code', command: 'npx prettier --write src/' },
            { id: 'step-6', name: 'Security Scan', command: 'npx c-f security scan' },
        ],
        lastRun: null,
    },
    {
        id: 'wf-3', name: 'System Backup', description: 'Creates a full system backup including memory and configurations.',
        steps: [
            { id: 'step-7', name: 'Backup Memory DB', command: 'npx c-f memory backup' },
            { id: 'step-8', name: 'Backup Config', command: 'npx c-f sys backup-config' },
            { id: 'step-9', name: 'Upload to Cloud', command: 'npx c-f integration aws s3 upload' },
        ],
        lastRun: null,
    }
];

const MOCK_SYSTEM_SERVICES: SystemService[] = [
    { id: 'sys-1', name: 'Master Control Program (MCP)', status: 'Operational', description: 'Main orchestration and command server.' },
    { id: 'sys-2', name: 'Neural & Cognitive Engine', status: 'Operational', description: 'Handles all AI/ML model inferences.' },
    { id: 'sys-3', name: 'Memory Database (SQLite)', status: 'Operational', description: 'Persistent storage for project memory.' },
    { id: 'sys-4', name: 'DAA Controller', status: 'Operational', description: 'Manages dynamic agent lifecycle.' },
    { id: 'sys-5', name: 'Hook Service', status: 'Degraded', description: 'Automated workflow trigger service.' },
    { id: 'sys-6', name: 'GitHub API Bridge', status: 'Operational', description: 'Connection to GitHub services.' },
];

const MOCK_INTEGRATIONS: Integration[] = [
    { id: 'int-1', provider: 'GitHub', account: 'user/my-app', status: 'Connected' },
    { id: 'int-2', provider: 'Google Drive', account: 'user@gmail.com', status: 'Connected' },
    { id: 'int-3', provider: 'AWS S3', account: 'my-s3-bucket', status: 'Disconnected' },
    { id: 'int-4', provider: 'Dropbox', account: 'user@dropbox.com', status: 'Disconnected' },
];

export const MCP_TOOLS: MCPCategory[] = [
  {
    name: "Swarm Orchestration (15 tools)",
    tools: [
      { name: 'swarm_init', description: 'Initializes a new swarm for a task.', example: 'c-f swarm init --task "Refactor API"' },
      { name: 'agent_spawn', description: 'Spawns a new agent within a swarm.', example: 'c-f agent_spawn --type Coder' },
      { name: 'task_orchestrate', description: 'Assigns and manages tasks within a swarm.', example: 'c-f task_orchestrate --task "Build UI"' },
      { name: 'swarm_monitor', description: 'Monitors the health and status of a swarm.', example: 'c-f swarm_monitor --id swarm-123' },
      { name: 'topology_optimize', description: 'Optimizes the communication topology of a swarm.', example: 'c-f topology_optimize' },
      { name: 'load_balance', description: 'Balances task load among agents in a swarm.', example: 'c-f load_balance --strategy round-robin' },
      { name: 'coordination_sync', description: 'Synchronizes state across all agents.', example: 'c-f coordination_sync' },
      { name: 'swarm_scale', description: 'Scales the number of agents in a swarm.', example: 'c-f swarm_scale --agents 10' },
      { name: 'swarm_destroy', description: 'Destroys an active swarm.', example: 'c-f swarm_destroy --id swarm-123' },
      // Assuming more tools to reach 15
      { name: 'agent_migrate', description: 'Migrates an agent to a different host.', example: 'c-f agent_migrate --agent-id 1 --host 2'},
      { name: 'task_delegate', description: 'Delegates a sub-task to another agent.', example: 'c-f task_delegate --task-id 1 --to-agent 2'},
      { name: 'swarm_state_get', description: 'Gets the current state of the swarm.', example: 'c-f swarm_state_get --id swarm-123'},
      { name: 'swarm_state_set', description: 'Sets the state of the swarm.', example: 'c-f swarm_state_set --id swarm-123 --state running'},
      { name: 'agent_status', description: 'Gets the status of an agent.', example: 'c-f agent_status --id agent-123'},
      { name: 'task_status', description: 'Gets the status of a task.', example: 'c-f task_status --id task-123'},
    ],
  },
  {
    name: "Neural & Cognitive (12 tools)",
    tools: [
      { name: 'neural_train', description: 'Trains a neural pattern.', example: 'c-f neural train --pattern coordination' },
      { name: 'neural_predict', description: 'Makes a prediction using a neural model.', example: 'c-f neural predict --model task-optimizer' },
      { name: 'pattern_recognize', description: 'Recognizes patterns in data.', example: 'c-f pattern_recognize --data logs.txt' },
      { name: 'cognitive_analyze', description: 'Analyzes cognitive behavior.', example: 'c-f cognitive analyze --behavior workflow' },
      { name: 'learning_adapt', description: 'Adapts learning models based on new data.', example: 'c-f learning_adapt --model my-model' },
      { name: 'neural_compress', description: 'Compresses a neural model for efficiency.', example: 'c-f neural_compress --model large-model' },
      { name: 'ensemble_create', description: 'Creates an ensemble of neural models.', example: 'c-f ensemble_create --models m1,m2' },
      { name: 'transfer_learn', description: 'Applies transfer learning from one domain to another.', example: 'c-f transfer_learn --from A --to B' },
      { name: 'neural_explain', description: 'Explains the decision-making process of a model.', example: 'c-f neural_explain --prediction_id 123' },
      { name: 'cognitive_map', description: 'Creates a cognitive map of a system.', example: 'c-f cognitive_map --system my-system'},
      { name: 'neural_prune', description: 'Prunes a neural network.', example: 'c-f neural_prune --model my-model'},
      { name: 'neural_quantize', description: 'Quantizes a neural network.', example: 'c-f neural_quantize --model my-model'},
    ],
  },
  {
    name: "Memory Management (10 tools)",
    tools: [
      { name: 'memory_store', description: 'Stores a value in memory.', example: 'c-f memory store key value' },
      { name: 'memory_query', description: 'Queries memory for a value.', example: 'c-f memory query key' },
      { name: 'memory_usage', description: 'Displays current memory usage statistics.', example: 'c-f memory usage' },
      { name: 'memory_search', description: 'Searches memory for a specific query.', example: 'c-f memory search "API keys"' },
      { name: 'memory_persist', description: 'Persists in-memory data to the database.', example: 'c-f memory persist' },
      { name: 'memory_namespace', description: 'Manages memory namespaces.', example: 'c-f memory_namespace --create auth' },
      { name: 'memory_backup', description: 'Backs up the memory database.', example: 'c-f memory backup backup.json' },
      { name: 'memory_restore', description: 'Restores memory from a backup.', example: 'c-f memory restore backup.json' },
      { name: 'memory_compress', description: 'Compresses memory to save space.', example: 'c-f memory compress' },
      { name: 'memory_sync', description: 'Synchronizes memory with a remote store.', example: 'c-f memory sync' },
    ],
  },
   {
    name: "Performance & Monitoring (10 tools)",
    tools: [
        { name: 'performance_report', description: 'Generates a performance report.', example: 'c-f perf report' },
        { name: 'bottleneck_analyze', description: 'Analyzes for performance bottlenecks.', example: 'c-f perf bottleneck' },
        { name: 'token_usage', description: 'Displays token usage statistics.', example: 'c-f perf token_usage' },
        { name: 'benchmark_run', description: 'Runs a performance benchmark.', example: 'c-f perf benchmark --suite full' },
        { name: 'metrics_collect', description: 'Collects system metrics.', example: 'c-f perf metrics' },
        { name: 'trend_analysis', description: 'Analyzes performance trends over time.', example: 'c-f perf trend --period 7d' },
        { name: 'health_check', description: 'Runs a system health check.', example: 'c-f health check' },
        { name: 'diagnostic_run', description: 'Runs system diagnostics.', example: 'c-f diag run' },
        { name: 'usage_stats', description: 'Displays usage statistics.', example: 'c-f usage stats' },
        { name: 'monitor_stream', description: 'Streams live monitoring data.', example: 'c-f monitor stream' },
    ]
  },
  {
      name: "Workflow Automation (10 tools)",
      tools: [
          { name: 'workflow_create', description: 'Creates a new workflow.', example: 'c-f wf create --name "CI/CD"' },
          { name: 'workflow_execute', description: 'Executes a workflow.', example: 'c-f wf exec "CI/CD"' },
          { name: 'workflow_export', description: 'Exports a workflow definition.', example: 'c-f wf export "CI/CD"' },
          { name: 'automation_setup', description: 'Sets up a new automation.', example: 'c-f auto setup' },
          { name: 'pipeline_create', description: 'Creates a new pipeline.', example: 'c-f pipe create' },
          { name: 'scheduler_manage', description: 'Manages the task scheduler.', example: 'c-f sched manage' },
          { name: 'trigger_setup', description: 'Sets up a new trigger.', example: 'c-f trigger setup' },
          { name: 'batch_process', description: 'Processes items in a batch.', example: 'c-f batch process --items a,b,c' },
          { name: 'parallel_execute', description: 'Executes tasks in parallel.', example: 'c-f parallel exec --tasks a,b,c' },
          { name: 'workflow_list', description: 'Lists all available workflows.', example: 'c-f wf list' },
      ]
  },
  {
    name: "GitHub Integration (6 tools)",
    tools: [
      { name: 'github_repo_analyze', description: 'Analyzes the structure of a GitHub repository.', example: 'c-f github repo_analyze' },
      { name: 'github_pr_manage', description: 'Manages pull requests (create, review, merge).', example: 'c-f github pr_manage --action review' },
      { name: 'github_issue_track', description: 'Tracks and manages GitHub issues.', example: 'c-f github issue_track --assign @me' },
      { name: 'github_release_coord', description: 'Coordinates a new software release.', example: 'c-f github release_coord --version 1.0' },
      { name: 'github_workflow_auto', description: 'Automates GitHub Actions workflows.', example: 'c-f github workflow_auto --trigger CI' },
      { name: 'github_code_review', description: 'Performs an AI-powered code review.', example: 'c-f github code_review --pr 123' },
    ],
  },
  {
    name: "Dynamic Agents (DAA) (6 tools)",
    tools: [
      { name: 'daa_agent_create', description: 'Creates a new dynamic agent.', example: 'c-f daa agent_create --type Researcher' },
      { name: 'daa_capability_match', description: 'Matches agent capabilities to tasks.', example: 'c-f daa capability-match --task "analyze data"' },
      { name: 'daa_resource_alloc', description: 'Allocates resources to an agent.', example: 'c-f daa resource_alloc --agent 1 --cpu 2' },
      { name: 'daa_lifecycle_manage', description: 'Manages the lifecycle of an agent.', example: 'c-f daa lifecycle_manage --agent 1 --action restart' },
      { name: 'daa_communication', description: 'Manages inter-agent communication.', example: 'c-f daa communication --send "hello" --to 2' },
      { name: 'daa_consensus', description: 'Manages consensus among agents.', example: 'c-f daa consensus --topic "release"' },
    ],
  },
   {
    name: "System & Security (8 tools)",
    tools: [
        { name: 'security_scan', description: 'Scans for security vulnerabilities.', example: 'c-f sec scan' },
        { name: 'backup_create', description: 'Creates a system backup.', example: 'c-f sys backup' },
        { name: 'restore_system', description: 'Restores the system from a backup.', example: 'c-f sys restore' },
        { name: 'config_manage', description: 'Manages system configuration.', example: 'c-f config manage' },
        { name: 'features_detect', description: 'Detects available system features.', example: 'c-f features detect' },
        { name: 'log_analysis', description: 'Analyzes system logs.', example: 'c-f log analysis' },
        { name: 'access_control', description: 'Manages user access control.', example: 'c-f access control --user 1 --grant admin' },
        { name: 'system_update', description: 'Updates the system to the latest version.', example: 'c-f sys update' },
    ]
  },
];


export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-my-app',
    name: 'My Awesome App',
    description: 'A full-stack application for managing complex workflows with AI agents.',
    template: 'Web App',
    hives: [
      { id: 'session-auth-123', name: 'User Authentication Flow', namespace: 'auth', status: HiveStatus.Active, agents: ['Queen', 'Coder', 'Security'], lastActivity: '5m ago' },
      { id: 'session-payments-456', name: 'Payment Gateway Integration', namespace: 'payments', status: HiveStatus.Processing, agents: ['Architect', 'Coder', 'DevOps'], lastActivity: '1m ago' },
      { id: 'session-users-456', name: 'User Profile Management', namespace: 'users', status: HiveStatus.Paused, agents: ['Coder', 'Analyst'], lastActivity: '2h ago' },
      { id: 'session-reporting-789', name: 'Generate Weekly Reports', namespace: 'reporting', status: HiveStatus.Idle, agents: ['Analyst', 'Researcher'], lastActivity: '1d ago' },
    ],
    files: [
       {
        id: 'source-local',
        name: 'Local Workspace',
        type: 'directory',
        source: 'local',
        children: [
           {
            id: 'file-1',
            name: 'src',
            type: 'directory',
            children: [
              { id: 'file-2', name: 'index.js', type: 'file', content: 'console.log("hello world");' },
              { id: 'file-3', name: 'api', type: 'directory', children: [
                { id: 'file-4', name: 'users.js', type: 'file', content: '// User API routes' }
              ]},
            ]
          },
          { id: 'file-5', name: 'package.json', type: 'file', content: '{ "name": "my-app", "version": "1.0.0" }'},
          { id: 'file-6', name: 'README.md', type: 'file', content: '# My Awesome App' },
        ]
      },
      {
        id: 'source-gdrive',
        name: 'Google Drive',
        type: 'directory',
        source: 'google-drive',
        children: [
            { id: 'gd-1', name: 'Design Docs', type: 'directory', children: [
                { id: 'gd-2', name: 'Architecture.gdoc', type: 'file', content: 'System Architecture Diagram...' }
            ]},
            { id: 'gd-3', name: 'Meeting Notes.gdoc', type: 'file', content: 'Q3 Planning Meeting...' },
        ]
      },
       {
        id: 'source-github',
        name: 'GitHub Repo',
        type: 'directory',
        source: 'github',
        children: [
          { id: 'gh-1', name: '.github', type: 'directory', children: [
            { id: 'gh-2', name: 'workflows', type: 'directory', children: [
                { id: 'gh-3', name: 'ci.yml', type: 'file', content: 'on: push...' }
            ] }
          ] },
        ]
      }
    ],
    memory: [
      { id: 'mem-1', namespace: 'auth', query: 'jwt implementation', summary: 'Used RS256 with a public/private key pair.', timestamp: '2024-07-28T10:00:00Z' },
      { id: 'mem-2', namespace: 'payments', query: 'stripe api key', summary: 'Stored Stripe API key in environment variables under STRIPE_SECRET_KEY.', timestamp: '2024-07-27T15:30:00Z' },
    ],
    settings: DEFAULT_SETTINGS,
    assistantSettings: DEFAULT_ASSISTANT_SETTINGS,
    roadmap: MOCK_ROADMAP,
    github: {
        url: 'https://github.com/user/my-app',
        issues: [
            { id: 55, title: 'Implement User Authentication', author: 'claude-bot', status: 'Open', boardStatus: 'In Progress', agentId: 'daa-coder-1' },
            { id: 52, title: 'Add 2FA Support', author: 'claude-bot', status: 'Open', boardStatus: 'Backlog', agentId: 'daa-arch-1' },
            { id: 56, title: 'Develop User Profile Page', author: 'claude-bot', status: 'Open', boardStatus: 'Backlog' },
            { id: 49, title: 'Fix Database Connection Leak', author: 'claude-bot', status: 'Closed', boardStatus: 'Done', agentId: 'daa-devops-1' },
        ],
        pullRequests: [
            { id: 100, title: 'fix: patch connection leak', author: 'claude-bot', status: 'Merged' },
            { id: 102, title: 'feat: add login endpoints', author: 'claude-bot', status: 'Open' },
        ]
    },
    daaAgents: MOCK_DAA_AGENTS,
    workflows: MOCK_WORKFLOWS,
    systemServices: MOCK_SYSTEM_SERVICES,
    integrations: MOCK_INTEGRATIONS,
    consensusTopics: MOCK_CONSENSUS_TOPICS,
    apiKeys: MOCK_API_KEYS,
  },
  {
    id: 'proj-data-pipeline',
    name: 'Data Processing Pipeline',
    description: 'ETL pipeline for analyzing user engagement metrics.',
    template: 'Data Analysis',
    hives: [
      { id: 'session-etl-1', name: 'Nightly Data Ingestion', namespace: 'etl', status: HiveStatus.Idle, agents: ['Researcher', 'Analyst'], lastActivity: '8h ago' },
    ],
    files: [
       {
         id: 'dp-source-local',
         name: 'Local Workspace',
         type: 'directory',
         source: 'local',
         children: [
            { id: 'file-dp-1', name: 'pipelines', type: 'directory', children: [
                { id: 'file-dp-2', name: 'ingest.py', type: 'file', content: '# Data ingestion script' },
                { id: 'file-dp-3', name: 'transform.py', type: 'file', content: '# Data transformation script' },
            ]},
            { id: 'file-dp-4', name: 'requirements.txt', type: 'file', content: 'pandas\nnumpy' },
         ]
       }
    ],
    memory: [
       { id: 'mem-dp-1', namespace: 'etl', query: 'source database schema', summary: 'User events are stored in a PostgreSQL database.', timestamp: '2024-07-26T11:00:00Z' },
    ],
    settings: DEFAULT_SETTINGS,
    assistantSettings: DEFAULT_ASSISTANT_SETTINGS,
    roadmap: [],
    daaAgents: [],
    workflows: [],
    systemServices: MOCK_SYSTEM_SERVICES,
    integrations: [],
    consensusTopics: [],
    apiKeys: MOCK_API_KEYS,
  }
];