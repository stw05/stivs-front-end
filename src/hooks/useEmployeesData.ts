import { useCallback, useEffect, useState } from 'react';
import { employeesApi } from '../api/services';
import { usePaginatedRemoteData } from './usePaginatedRemoteData';

interface EmployeesFilterParams {
  searchTerm: string;
  position: string;
  degree: string;
  hIndexGroup: '0-1' | '2-5' | '6-10' | '10+' | 'all';
}

const H_INDEX_RANGE_BY_GROUP: Record<EmployeesFilterParams['hIndexGroup'], { min?: number; max?: number }> = {
  '0-1': { min: 0, max: 1 },
  '2-5': { min: 2, max: 5 },
  '6-10': { min: 6, max: 10 },
  '10+': { min: 10 },
  all: {},
};

interface UseEmployeesDataParams<TEmployee> {
  filters: EmployeesFilterParams;
  selectedRegionId: string;
  regionNameById: Record<string, string>;
  currentPage: number;
  pageLimit: number;
  fallbackItems: TEmployee[];
  mapItem: (item: any) => TEmployee;
}

export const useEmployeesData = <TEmployee>({
  filters,
  selectedRegionId,
  regionNameById,
  currentPage,
  pageLimit,
  fallbackItems,
  mapItem,
}: UseEmployeesDataParams<TEmployee>) => {
  const [employeeFilters, setEmployeeFilters] = useState<{
    position: string[];
    degree: string[];
  } | null>(null);
  const [employeeFiltersMeta, setEmployeeFiltersMeta] = useState<{
    position: Array<{ value: string; count: number }>;
    degree: Array<{ value: string; count: number }>;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();

    const loadEmployeeFilters = async () => {
      try {
        const payload = await employeesApi.filters();
        if (!controller.signal.aborted) {
          setEmployeeFilters({
            position: payload.position,
            degree: payload.degree,
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setEmployeeFilters(null);
        }
      }
    };

    void loadEmployeeFilters();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadEmployeeFiltersMeta = async () => {
      try {
        const hIndexRange = H_INDEX_RANGE_BY_GROUP[filters.hIndexGroup];
        const payload = await employeesApi.filtersMeta({
          region: selectedRegionId === 'national' ? undefined : (regionNameById[selectedRegionId] ?? undefined),
          position: filters.position === 'all' ? undefined : filters.position,
          degree: filters.degree === 'all' ? undefined : filters.degree,
          minHIndex: hIndexRange.min,
          maxHIndex: hIndexRange.max,
          q: filters.searchTerm || undefined,
        }, controller.signal);

        setEmployeeFiltersMeta({
          position: payload.position,
          degree: payload.degree,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setEmployeeFiltersMeta(null);
      }
    };

    void loadEmployeeFiltersMeta();

    return () => {
      controller.abort();
    };
  }, [
    filters.degree,
    filters.hIndexGroup,
    filters.position,
    filters.searchTerm,
    regionNameById,
    selectedRegionId,
  ]);

  const loadPage = useCallback((signal: AbortSignal) => {
    const hIndexRange = H_INDEX_RANGE_BY_GROUP[filters.hIndexGroup];

    return employeesApi.list({
      page: currentPage,
      limit: pageLimit,
      region: selectedRegionId === 'national' ? undefined : (regionNameById[selectedRegionId] ?? undefined),
      position: filters.position === 'all' ? undefined : filters.position,
      degree: filters.degree === 'all' ? undefined : filters.degree,
      minHIndex: hIndexRange.min,
      maxHIndex: hIndexRange.max,
      q: filters.searchTerm || undefined,
    }, signal);
  }, [
    currentPage,
    pageLimit,
    selectedRegionId,
    regionNameById,
    filters.position,
    filters.degree,
    filters.hIndexGroup,
    filters.searchTerm,
  ]);

  const {
    data: employeesData,
    isLoading,
    loadError,
    pageMeta,
  } = usePaginatedRemoteData({
    currentPage,
    pageLimit,
    fallbackItems,
    mapItem,
    loadPage,
    errorMessage: 'Не удалось загрузить сотрудников с backend.',
  });

  return {
    employeesData,
    isLoading,
    loadError,
    employeeFilters,
    employeeFiltersMeta,
    pageMeta,
  };
};
