import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import AdminView from './AdminView';

describe('AdminView', () => {
  it('fetches and displays users', async () => {
    const users = [{ id: 1, username: 'u', email: 'e@test.com', created_at: '' }];
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(users) }));
    (global as any).fetch = fetchMock;
    const { getByText } = render(<AdminView />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/users'));
    expect(getByText('u')).toBeTruthy();
  });
});
