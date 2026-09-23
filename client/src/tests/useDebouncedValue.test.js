import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update immediately when value changes', () => {
    const { result, rerender } = renderHook(({ val }) => useDebouncedValue(val, 300), {
      initialProps: { val: 'hello' },
    });

    rerender({ val: 'world' });
    expect(result.current).toBe('hello'); // still the old value
  });

  it('updates after the delay has passed', () => {
    const { result, rerender } = renderHook(({ val }) => useDebouncedValue(val, 300), {
      initialProps: { val: 'hello' },
    });

    rerender({ val: 'world' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('world');
  });

  it('only fires once for rapid successive changes (debounces)', () => {
    const { result, rerender } = renderHook(({ val }) => useDebouncedValue(val, 300), {
      initialProps: { val: 'a' },
    });

    rerender({ val: 'ab' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ val: 'abc' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ val: 'abcd' });
    act(() => vi.advanceTimersByTime(300)); // only now fires

    expect(result.current).toBe('abcd');
  });

  it('uses 300ms default delay', () => {
    const { result, rerender } = renderHook(({ val }) => useDebouncedValue(val), {
      initialProps: { val: 'init' },
    });
    rerender({ val: 'changed' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('init');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('changed');
  });
});
