import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ProjectList from './ProjectList';
import { Project } from '../types';

describe('ProjectList', () => {
  it('renders project names', () => {
    const projects: Project[] = [{ id: '1', name: 'P', description: '', hives: [], template: 't', created_at: '' }];
    const { getByText } = render(<ProjectList projects={projects} onSelect={() => {}} />);
    expect(getByText('P')).toBeTruthy();
  });
});
