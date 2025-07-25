import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import WorkflowsView from './WorkflowsView';
import { Project } from '../../types';

beforeAll(() => {
  (global as any).ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
});

const noop = () => {};

const project: Project = {
  id: 'p1',
  name: 'Test',
  description: '',
  hives: [],
  files: [],
  memory: [],
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

describe('WorkflowsView', () => {
  it('fetches session list on mount', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
    (global as any).fetch = fetchMock;
    render(<WorkflowsView project={project} addLog={noop} onCreateWorkflow={noop} onQueryHoD={noop} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/session/list'));
  });
});
