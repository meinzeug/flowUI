import { describe, it, expect, fireEvent, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import ProjectCreateModal, { Template } from './ProjectCreateModal';

describe('ProjectCreateModal', () => {
  it('calls onCreate with values', () => {
    const tmpl: Template[] = [{ name: 'Empty', description: '' }];
    const spy = vi.fn();
    const { getAllByRole, getByText } = render(
      <ProjectCreateModal isOpen templates={tmpl} onCreate={spy} onClose={() => {}} />
    );
    const input = document.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.click(getByText('Create Project'));
    expect(spy).toHaveBeenCalledWith('A', '', 'Empty');
  });
});
