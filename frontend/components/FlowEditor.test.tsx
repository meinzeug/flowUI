import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import FlowEditor, { GraphData } from './FlowEditor';

beforeAll(() => {
  (global as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const graph: GraphData = { nodes: [{ id: '1', position: { x: 0, y: 0 }, data: { label: 'N1' } }], edges: [] };

describe('FlowEditor', () => {
  it('calls onSave when Ctrl+S is pressed', () => {
    const onSave = vi.fn();
    const { container } = render(<FlowEditor onSave={onSave} initial={graph} />);
    fireEvent.keyDown(container, { key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalledWith(graph);
  });
});
