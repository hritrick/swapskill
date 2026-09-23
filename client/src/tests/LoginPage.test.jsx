import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../components/LoginPage.jsx';
import { AppContext } from '../context/AppContext.jsx';

function renderLoginPage(appContextOverrides = {}) {
  const defaultAppContext = {
    user: null,
    loadingAuth: false,
    login: vi.fn(),
    register: vi.fn(),
    ...appContextOverrides,
  };

  return render(
    <MemoryRouter>
      <AppContext.Provider value={defaultAppContext}>
        <LoginPage />
      </AppContext.Provider>
    </MemoryRouter>
  );
}

describe('LoginPage component', () => {
  it('renders sign-in form by default', () => {
    renderLoginPage();
    expect(screen.getByRole('heading', { name: /sign in to trade/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('switches between Sign In and Register', () => {
    renderLoginPage();
    const registerToggle = screen.getByRole('button', { name: /^register$/i });
    fireEvent.click(registerToggle);
    expect(screen.getByRole('heading', { name: /register to trade/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();

    const loginToggle = screen.getByRole('button', { name: /^log in$/i });
    fireEvent.click(loginToggle);
    expect(screen.getByRole('heading', { name: /sign in to trade/i })).toBeInTheDocument();
  });

  it('validates empty inputs on submit', async () => {
    renderLoginPage();
    const submitBtn = screen.getByRole('button', { name: /enter swapskill/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
  });

  it('calls login function on submit with valid credentials', async () => {
    const login = vi.fn().mockResolvedValue({});
    renderLoginPage({ login });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    const submitBtn = screen.getByRole('button', { name: /enter swapskill/i });
    fireEvent.click(submitBtn);

    expect(login).toHaveBeenCalledWith('alice@example.com', 'password123');
  });
});
