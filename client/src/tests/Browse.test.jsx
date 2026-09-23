import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Browse from '../components/Browse.jsx';
import { SkillsContext } from '../context/SkillsContext.jsx';
import { AppContext } from '../context/AppContext.jsx';
import { SwapsContext } from '../context/SwapsContext.jsx';

const mockSkills = [
  { _id: 's1', title: 'React Basics', wants: 'Guitar', cat: 'tech', by: 'Alice' },
  { _id: 's2', title: 'Acoustic Guitar', wants: 'French', cat: 'craft', by: 'Bob' },
  { _id: 's3', title: 'French Conversation', wants: 'Coding', cat: 'language', by: 'Charlie' },
];

function renderBrowseWithContext(skillsContextOverrides = {}) {
  const defaultSkillsContext = {
    skills: mockSkills,
    loading: false,
    search: '',
    setSearch: vi.fn(),
    category: 'all',
    setCategory: vi.fn(),
    addSkill: vi.fn(),
    deleteSkill: vi.fn(),
    ...skillsContextOverrides,
  };

  const defaultAppContext = {
    user: { _id: 'u1', name: 'Test User' },
  };

  const defaultSwapsContext = {
    openProposal: vi.fn(),
  };

  return render(
    <AppContext.Provider value={defaultAppContext}>
      <SwapsContext.Provider value={defaultSwapsContext}>
        <SkillsContext.Provider value={defaultSkillsContext}>
          <Browse />
        </SkillsContext.Provider>
      </SwapsContext.Provider>
    </AppContext.Provider>
  );
}

describe('Browse component', () => {
  it('renders skill cards when loaded', () => {
    renderBrowseWithContext();
    expect(screen.getByText('React Basics')).toBeInTheDocument();
    expect(screen.getByText('Acoustic Guitar')).toBeInTheDocument();
    expect(screen.getByText('French Conversation')).toBeInTheDocument();
  });

  it('renders loading state when loading is true', () => {
    renderBrowseWithContext({ loading: true, skills: [] });
    expect(screen.getByText(/loading open swaps/i)).toBeInTheDocument();
  });

  it('renders category filter buttons', () => {
    const setCategory = vi.fn();
    renderBrowseWithContext({ setCategory });
    const techBtn = screen.getByRole('button', { name: /tech/i });
    expect(techBtn).toBeInTheDocument();
    fireEvent.click(techBtn);
    expect(setCategory).toHaveBeenCalledWith('tech');
  });

  it('updates search input', () => {
    const setSearch = vi.fn();
    renderBrowseWithContext({ setSearch });
    const input = screen.getByPlaceholderText(/search skills/i);
    fireEvent.change(input, { target: { value: 'guitar' } });
    expect(setSearch).toHaveBeenCalledWith('guitar');
  });
});
