import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import ServerStatus from './ServerStatus';

describe('ServerStatus', () => {
  it('fetches status and displays user count', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ status: 'ok', userCount: 3 }) }));
    (global as any).fetch = fetchMock;
    const { getByText } = render(<ServerStatus />);
    await waitFor(() => getByText('Online (3)'));
    expect(fetchMock).toHaveBeenCalledWith('/api/status');
  });
});
