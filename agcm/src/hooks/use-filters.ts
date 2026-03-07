'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterConfig } from '@/components/ui/filters';

interface UseFiltersOptions {
  filters: FilterConfig[];
  onFilterChange?: (values: Record<string, any>) => void;
}

export function useFilters(options: UseFiltersOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, onFilterChange } = options;

  // Initialize filter values from URL params
  const getInitialValues = useCallback(() => {
    const values: Record<string, any> = {};
    filters.forEach((filter) => {
      const value = searchParams.get(filter.key);
      if (value !== null) {
        if (filter.type === 'boolean') {
          values[filter.key] = value === 'true';
        } else {
          values[filter.key] = value;
        }
      }
    });
    return values;
  }, [filters, searchParams]);

  const [values, setValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    filters.forEach((filter) => {
      const value = searchParams.get(filter.key);
      if (value !== null) {
        if (filter.type === 'boolean') {
          initial[filter.key] = value === 'true';
        } else {
          initial[filter.key] = value;
        }
      }
    });
    return initial;
  });

  // Update URL when filters change
  const updateFilters = useCallback(
    (newValues: Record<string, any>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset page when filters change
      params.set('page', '1');

      filters.forEach((filter) => {
        const value = newValues[filter.key];
        if (value !== '' && value !== null && value !== undefined) {
          params.set(filter.key, String(value));
        } else {
          params.delete(filter.key);
        }
      });

      router.push(`?${params.toString()}`);
      setValues(newValues);
      onFilterChange?.(newValues);
    },
    [filters, searchParams, router, onFilterChange]
  );

  const resetFilters = useCallback(() => {
    const emptyValues: Record<string, any> = {};
    filters.forEach((filter) => {
      emptyValues[filter.key] = filter.type === 'boolean' ? undefined : '';
    });
    updateFilters(emptyValues);
  }, [filters, updateFilters]);

  // Sync with URL changes (e.g., browser back/forward)
  // Use searchParams.toString() as a stable dependency to avoid infinite loops
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    const newValues: Record<string, any> = {};
    filters.forEach((filter) => {
      const value = searchParams.get(filter.key);
      if (value !== null) {
        if (filter.type === 'boolean') {
          newValues[filter.key] = value === 'true';
        } else {
          newValues[filter.key] = value;
        }
      }
    });
    
    setValues((prevValues) => {
      // Only update if values actually changed to avoid unnecessary re-renders
      const hasChanged = Object.keys(newValues).some(
        (key) => newValues[key] !== prevValues[key]
      ) || Object.keys(prevValues).some(
        (key) => !(key in newValues) || newValues[key] !== prevValues[key]
      );
      
      return hasChanged ? newValues : prevValues;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsString, filters.length]); // Use stable dependencies - searchParams is used inside but not in deps

  return {
    values,
    updateFilters,
    resetFilters,
  };
}


