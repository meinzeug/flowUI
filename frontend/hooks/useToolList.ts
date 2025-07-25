import { useEffect, useState } from 'react';

import { MCPCategory } from '../types';

export default function useToolList() {
  const [tools, setTools] = useState<MCPCategory[]>([]);

  useEffect(() => {
    fetch('/tools/list')
      .then(res => res.json())
      .then((result: MCPCategory[]) => setTools(result));
  }, []);

  return tools;
}
