import { useEffect, useState } from 'react';
import { wsService } from '../WebSocketService';
import { MCPCategory } from '../types';

export default function useToolList() {
  const [tools, setTools] = useState<MCPCategory[]>([]);

  useEffect(() => {
    wsService.call('tools/list').then((result: MCPCategory[]) => setTools(result));
  }, []);

  return tools;
}
