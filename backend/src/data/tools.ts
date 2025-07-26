export interface MCPTool {
  name: string;
  description: string;
  example?: string;
}

export interface MCPCategory {
  name: string;
  tools: MCPTool[];
}

const catalog: MCPCategory[] = [
  {
    name: 'Swarm Orchestration',
    tools: [
      { name: 'swarm_init', description: 'Initializes a new swarm for a task.', example: 'c-f swarm init --task "Refactor API"' },
      { name: 'agent_spawn', description: 'Spawns a new agent within a swarm.', example: 'c-f agent_spawn --type Coder' }
    ]
  },
  {
    name: 'Neural & Cognitive',
    tools: [
      { name: 'neural_train', description: 'Trains a neural pattern.', example: 'c-f neural train --pattern coordination' },
      { name: 'neural_predict', description: 'Makes a prediction using a neural model.', example: 'c-f neural predict --model task-optimizer' }
    ]
  }
];

export default catalog;
