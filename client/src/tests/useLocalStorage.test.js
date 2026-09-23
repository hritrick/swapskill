import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('persists the value to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', null));
    act(() => result.current[1]('stored value'));
    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('stored value'));
  });

  it('reads an existing value from localStorage', () => {
    window.localStorage.setItem('test-key', JSON.stringify({ name: 'Alice' }));
    const { result } = renderHook(() => useLocalStorage('test-key', null));
    expect(result.current[0]).toEqual({ name: 'Alice' });
  });

  it('returns the initial value when stored JSON is corrupt', () => {
    window.localStorage.setItem('test-key', 'this is not json {{{');
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('sets value to null on logout pattern', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', { user: 'dev' }));
    act(() => result.current[1](null));
    expect(result.current[0]).toBeNull();
    expect(window.localStorage.getItem('test-key')).toBe('null');
  });
});
