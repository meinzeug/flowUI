import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import DashboardView from './DashboardView';
import { Project } from '../../types';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
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

describe('DashboardView', () => {
  it('renders without crashing', () => {
    render(
      <DashboardView
        project={project}
        onSpawnHive={noop}
        onUpdateHive={noop}
        onRunSwarm={noop}
        onDestroyHive={noop}
        onInitiateProject={noop}
        onQueryHoD={noop}
      />
    );
  });
});
