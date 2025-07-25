import { describe, it, expect, beforeAll } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import MemoryView from './MemoryView';
import { Project, MemoryEntry } from '../../types';

beforeAll(() => {
  (global as any).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
});

const project: Project = {
  id: 'p1',
  name: 'Test',
  description: '',
  hives: [],
  files: [],
  memory: [
    { id: '1', namespace: 'default', query: 'authentication', summary: 'notes', timestamp: new Date().toISOString() },
    { id: '2', namespace: 'default', query: 'auth flow', summary: 'details', timestamp: new Date().toISOString() }
  ],
  settings: {} as any,
  assistantSettings: {} as any,
  roadmap: [],
  daaAgents: [],
  workflows: [],
  systemServices: [],
  integrations: [],
  apiKeys: [],
  consensusTopics: [],
};

describe('MemoryView', () => {
  it('shows query suggestions when typing', () => {
    render(<MemoryView project={project} onStoreMemory={() => {}} addLog={() => {}} />);
    const input = screen.getByPlaceholderText(/Query memory/);
    fireEvent.change(input, { target: { value: 'auth' } });
    expect(screen.getAllByText('authentication').length).toBeGreaterThan(0);
  });
});
