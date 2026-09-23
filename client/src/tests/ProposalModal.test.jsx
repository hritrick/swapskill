import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProposalModal from '../components/ProposalModal.jsx';
import { SkillsContext } from '../context/SkillsContext.jsx';
import { AppContext } from '../context/AppContext.jsx';
import { SwapsContext } from '../context/SwapsContext.jsx';

describe('ProposalModal component', () => {
  const mockCloseProposal = vi.fn();
  const mockUser = { _id: 'user123', name: 'Dev', token: 'fake-jwt-token' };

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('renders modal with skill and resolved author name', () => {
    const proposalTarget = {
      _id: 'skill999',
      title: 'Watercolor painting',
      cat: 'craft',
      wants: 'Guitar',
      owner: { _id: 'owner456', name: 'Ila' },
    };

    render(
      <AppContext.Provider value={{ user: mockUser }}>
        <SwapsContext.Provider value={{ proposalTarget, closeProposal: mockCloseProposal }}>
          <SkillsContext.Provider value={{ skills: [] }}>
            <ProposalModal />
          </SkillsContext.Provider>
        </SwapsContext.Provider>
      </AppContext.Provider>
    );

    expect(screen.getByText(/Trade for “Watercolor painting”/i)).toBeInTheDocument();
    expect(screen.getByText(/Requesting from Ila/i)).toBeInTheDocument();
  });

  it('sends correct toUser payload using ownerId or owner fallback', async () => {
    const proposalTarget = {
      _id: 'skill999',
      title: 'Watercolor painting',
      cat: 'craft',
      wants: 'Guitar',
      owner: { _id: 'owner456', name: 'Ila' },
    };

    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { _id: 'swap1' } }),
    });

    render(
      <AppContext.Provider value={{ user: mockUser }}>
        <SwapsContext.Provider value={{ proposalTarget, closeProposal: mockCloseProposal }}>
          <SkillsContext.Provider value={{ skills: [] }}>
            <ProposalModal />
          </SkillsContext.Provider>
        </SwapsContext.Provider>
      </AppContext.Provider>
    );

    const input = screen.getByPlaceholderText(/e.g. Guitar lessons/i);
    fireEvent.change(input, { target: { value: 'x' } });

    const submitBtn = screen.getByRole('button', { name: /Send proposal/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/swaps', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer fake-jwt-token',
        }),
        body: JSON.stringify({
          toUser: 'owner456',
          skill: 'skill999',
          offeredSkill: 'x',
          hours: 1,
        }),
      }));
    });

    expect(screen.getByText(/Proposal sent to Ila/i)).toBeInTheDocument();
  });
});
