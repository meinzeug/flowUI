import React, { useEffect, useState } from 'react';

const ServerStatus: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setCount(data.userCount))
      .catch(() => setError(true));
  }, []);

  if (error) return <span className="text-red-500">Server Error</span>;
  if (count === null) return <span className="text-slate-400">Loading...</span>;
  return <span className="text-green-400">Online ({count})</span>;
};

export default ServerStatus;
