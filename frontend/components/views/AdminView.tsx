import React, { useEffect, useState } from 'react';
import { User } from '../../types';

const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <ul className="space-y-1">
        {users.map(u => (
          <li key={u.id}>{u.username} - {u.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminView;
