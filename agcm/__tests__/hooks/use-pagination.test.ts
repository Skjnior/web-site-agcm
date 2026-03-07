// __tests__/hooks/use-pagination.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/use-pagination';
import { useSearchParams, useRouter } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe('usePagination Hook', () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it('should initialize with default values', () => {
    mockSearchParams.delete('page');
    mockSearchParams.delete('limit');

    const { result } = renderHook(() => usePagination({ defaultLimit: 10 }));

    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(10);
    expect(result.current.offset).toBe(0);
  });

  it('should read page from URL params', () => {
    mockSearchParams.set('page', '3');
    mockSearchParams.set('limit', '10');

    const { result } = renderHook(() => usePagination({ defaultLimit: 10 }));

    expect(result.current.page).toBe(3);
    expect(result.current.offset).toBe(20); // (3-1) * 10 = 20
  });

  it('should read limit from URL params', () => {
    mockSearchParams.set('limit', '20');

    const { result } = renderHook(() => usePagination());

    expect(result.current.limit).toBe(20);
  });

  it('should update page', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setPage(2);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });

  it('should update limit', () => {
    const { result } = renderHook(() => usePagination());

    act(() => {
      result.current.setLimit(25);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('limit=25'));
  });

  it('should handle invalid page values', () => {
    mockSearchParams.set('page', '0');

    const { result } = renderHook(() => usePagination({ defaultLimit: 10 }));

    expect(result.current.page).toBe(1); // Invalid page defaults to 1
  });

  it('should handle invalid limit values', () => {
    mockSearchParams.set('limit', '0');

    const { result } = renderHook(() => usePagination({ defaultLimit: 10 }));

    expect(result.current.limit).toBe(10); // Invalid limit defaults to defaultLimit
  });
});


