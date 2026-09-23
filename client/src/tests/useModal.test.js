import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../hooks/useModal.js';

// Read the hook to understand its API
describe('useModal', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens when open() is called', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('closes when close() is called', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles correctly', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  describe('Escape key handling', () => {
    beforeEach(() => {
      vi.spyOn(document, 'addEventListener');
      vi.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('closes on Escape when open', () => {
      const { result } = renderHook(() => useModal());
      act(() => result.current.open());
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('does not crash on Escape when already closed', () => {
      const { result } = renderHook(() => useModal());
      act(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });
      expect(result.current.isOpen).toBe(false);
    });
  });
});
