import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import AdminView from './AdminView';

describe('AdminView', () => {
  it('fetches and displays users', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 1, username: 'alice', email: 'a@test.com' }]) }));
    (global as any).fetch = fetchMock;
    const { getByText } = render(<AdminView />);
    await waitFor(() => getByText('alice - a@test.com'));
    expect(fetchMock).toHaveBeenCalledWith('/api/users');
  });
});
