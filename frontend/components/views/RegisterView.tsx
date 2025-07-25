import React, { useState } from 'react';
import { Card, Button } from '../UI';
import { useAuth } from '../../hooks/useAuth';

const RegisterView: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(username, email, password);
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
          />
          <Button type="submit" className="w-full">Register</Button>
        </form>
        <button onClick={onSwitch} className="text-sm text-cyan-400 w-full text-center">Back to Login</button>
      </Card>
    </div>
  );
};

export default RegisterView;
