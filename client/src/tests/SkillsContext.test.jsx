import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useContext } from 'react';
import { SkillsContext, SkillsProvider } from '../context/SkillsContext.jsx';
import { AppContext } from '../context/AppContext.jsx';
import { SwapsContext } from '../context/SwapsContext.jsx';

function ConsumerComponent() {
  const { skills, loading } = useContext(SkillsContext);
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <span data-testid="count">{skills.length}</span>
      <ul>
        {skills.map((s) => (
          <li key={s._id} data-testid={`skill-${s._id}`}>
            {s.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('SkillsContext real-time socket events', () => {
  let mockSocket;
  let eventHandlers;

  beforeEach(() => {
    eventHandlers = {};
    mockSocket = {
      on: vi.fn((event, handler) => {
        eventHandlers[event] = handler;
      }),
      off: vi.fn((event) => {
        delete eventHandlers[event];
      }),
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: 's1', title: 'Initial Skill', cat: 'tech', wants: 'Guitar' }],
      }),
    });
  });

  function renderTree() {
    return render(
      <AppContext.Provider value={{ user: { _id: 'u1', token: 'token123' } }}>
        <SwapsContext.Provider value={{ socket: mockSocket }}>
          <SkillsProvider>
            <ConsumerComponent />
          </SkillsProvider>
        </SwapsContext.Provider>
      </AppContext.Provider>
    );
  }

  it('receives skill:new and updates skills list in real time', async () => {
    renderTree();

    expect(await screen.findByTestId('skill-s1')).toBeInTheDocument();
    expect(screen.getByTestId('count').textContent).toBe('1');

    act(() => {
      eventHandlers['skill:new']({
        _id: 's2',
        title: 'New Realtime Skill',
        cat: 'craft',
        wants: 'French',
      });
    });

    expect(await screen.findByTestId('skill-s2')).toBeInTheDocument();
    expect(screen.getByText('New Realtime Skill')).toBeInTheDocument();
    expect(screen.getByTestId('count').textContent).toBe('2');
  });

  it('ignores duplicate skill:new events', async () => {
    renderTree();

    expect(await screen.findByTestId('skill-s1')).toBeInTheDocument();

    act(() => {
      eventHandlers['skill:new']({
        _id: 's1',
        title: 'Initial Skill Duplicate',
        cat: 'tech',
        wants: 'Guitar',
      });
    });

    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('removes skill when skill:deleted is received', async () => {
    renderTree();

    expect(await screen.findByTestId('skill-s1')).toBeInTheDocument();

    act(() => {
      eventHandlers['skill:deleted']({ _id: 's1' });
    });

    expect(screen.queryByTestId('skill-s1')).not.toBeInTheDocument();
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('updates skill when skill:updated is received', async () => {
    renderTree();

    expect(await screen.findByTestId('skill-s1')).toBeInTheDocument();

    act(() => {
      eventHandlers['skill:updated']({
        _id: 's1',
        title: 'Updated Skill Title',
        cat: 'tech',
        wants: 'Piano',
      });
    });

    expect(screen.getByText('Updated Skill Title')).toBeInTheDocument();
  });
});
