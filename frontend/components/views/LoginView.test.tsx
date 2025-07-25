import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginView from './LoginView';
import { AuthProvider } from '../../hooks/useAuth';

const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('LoginView', () => {
  it('calls /api/auth/login on submit', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 't' }) }));
    (global as any).fetch = fetchMock;
    const { getByPlaceholderText, getByRole } = render(<LoginView onSwitch={() => {}} />, { wrapper: Wrapper });
    fireEvent.change(getByPlaceholderText(/username/i), { target: { value: 'u' } });
    fireEvent.change(getByPlaceholderText(/password/i), { target: { value: 'p' } });
    fireEvent.click(getByRole('button', { name: /login/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe('/api/auth/login');
  });
});
