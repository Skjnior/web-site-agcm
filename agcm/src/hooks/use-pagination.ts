'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  onPageChange?: (page: number, limit: number) => void;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { defaultPage = 1, defaultLimit = 20, onPageChange } = options;

  // Parse page: ensure it's a valid number >= 1
  const pageParam = searchParams.get('page');
  const parsedPage = pageParam ? parseInt(pageParam, 10) : defaultPage;
  const page = isNaN(parsedPage) || parsedPage < 1 ? defaultPage : parsedPage;
  
  // Parse limit: ensure it's a valid number >= 1
  const limitParam = searchParams.get('limit');
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : defaultLimit;
  const limit = isNaN(parsedLimit) || parsedLimit < 1 ? defaultLimit : parsedLimit;

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.push(`?${params.toString()}`);
      onPageChange?.(newPage, limit);
    },
    [searchParams, router, limit, onPageChange]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('limit', String(newLimit));
      params.set('page', '1'); // Reset to first page when changing limit
      router.push(`?${params.toString()}`);
      onPageChange?.(1, newLimit);
    },
    [searchParams, router, onPageChange]
  );

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
  };
}


