import catalog, { MCPCategory } from '../data/tools.js';

export async function list(): Promise<MCPCategory[]> {
  return catalog;
}

export default { list };
