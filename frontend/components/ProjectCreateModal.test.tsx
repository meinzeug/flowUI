import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ProjectCreateModal, { Template } from './ProjectCreateModal';

describe('ProjectCreateModal', () => {
  it('calls onCreate with values', () => {
    const tmpl: Template[] = [{ name: 'Empty', description: '' }];
    const spy = vi.fn();
    render(
      <ProjectCreateModal isOpen templates={tmpl} onCreate={spy} onClose={() => {}} />
    );
    const input = screen.getByPlaceholderText('Project name');
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.click(screen.getByText('Create Project'));
    expect(spy).toHaveBeenCalledWith('A', '', 'Empty');
  });
});
