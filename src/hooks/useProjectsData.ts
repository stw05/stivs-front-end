import { useCallback, useEffect, useState } from 'react';
import { projectsApi } from '../api/services';
import { usePaginatedRemoteData } from './usePaginatedRemoteData';

interface ProjectsFilterParams {
  irn: string;
  status: string;
  financingType: string;
  priority: string;
  applicant: string;
  contest: string;
  customer: string;
  mrnti: string;
  trl: number | 'all';
  startYear: number;
  endYear: number;
}

interface UseProjectsDataParams<TProject> {
  filters: ProjectsFilterParams;
  debouncedSearch: string;
  selectedRegionId: string;
  regionNameById: Record<string, string>;
  currentPage: number;
  pageLimit: number;
  fallbackItems: TProject[];
  mapItem: (item: any) => TProject;
}

export const useProjectsData = <TProject>({
  filters,
  debouncedSearch,
  selectedRegionId,
  regionNameById,
  currentPage,
  pageLimit,
  fallbackItems,
  mapItem,
}: UseProjectsDataParams<TProject>) => {
  const [projectFilters, setProjectFilters] = useState<{
    irn: string[];
    applicant: string[];
    mrnti: string[];
    trl: string[];
  } | null>(null);
  const [projectFiltersMeta, setProjectFiltersMeta] = useState<{
    irn: Array<{ value: string; count: number }>;
    applicant: Array<{ value: string; count: number }>;
    mrnti: Array<{ value: string; count: number }>;
    financingType: Array<{ value: string; count: number }>;
  } | null>(null);
  useEffect(() => {
    const loadProjectFilters = async () => {
      try {
        const payload = await projectsApi.filters();
        setProjectFilters({
          irn: payload.irn,
          applicant: payload.applicant,
          mrnti: payload.mrnti,
          trl: payload.trl,
        });
      } catch {
        setProjectFilters(null);
      }
    };

    void loadProjectFilters();
  }, []);

  useEffect(() => {
    const loadProjectFilterMeta = async () => {
      try {
        const payload = await projectsApi.filtersMeta({
          irn: filters.irn === 'all' ? undefined : filters.irn,
          status: filters.status === 'all' ? undefined : filters.status,
          region:
            selectedRegionId === 'national'
              ? undefined
              : (regionNameById[selectedRegionId] ?? undefined),
          financingType: filters.financingType === 'all' ? undefined : filters.financingType,
          priority: filters.priority === 'all' ? undefined : filters.priority,
          applicant: filters.applicant === 'all' ? undefined : filters.applicant,
          q: debouncedSearch || undefined,
        });

        setProjectFiltersMeta({
          irn: payload.irn,
          applicant: payload.applicant,
          mrnti: payload.mrnti,
          financingType: payload.financingType,
        });
      } catch {
        setProjectFiltersMeta(null);
      }
    };

    void loadProjectFilterMeta();
  }, [
    filters.applicant,
    filters.financingType,
    filters.irn,
    filters.priority,
    filters.status,
    debouncedSearch,
    regionNameById,
    selectedRegionId,
  ]);

  const loadPage = useCallback((signal: AbortSignal) =>
    projectsApi.list({
      page: currentPage,
      limit: pageLimit,
      irn: filters.irn === 'all' ? undefined : filters.irn,
      q: debouncedSearch || undefined,
      region:
        selectedRegionId === 'national'
          ? undefined
          : (regionNameById[selectedRegionId] ?? undefined),
      financingType: filters.financingType === 'all' ? undefined : filters.financingType,
      priority: filters.priority === 'all' ? undefined : filters.priority,
      applicant: filters.applicant === 'all' ? undefined : filters.applicant,
      status: filters.status === 'all' ? undefined : filters.status,
      contest: filters.contest === 'all' ? undefined : filters.contest,
      customer: filters.customer === 'all' ? undefined : filters.customer,
      mrnti: filters.mrnti === 'all' ? undefined : filters.mrnti,
      trl: filters.trl === 'all' ? undefined : filters.trl,
      startYear: filters.startYear,
      endYear: filters.endYear,
    }, signal),
  [
    currentPage,
    pageLimit,
    filters.irn,
    filters.financingType,
    filters.priority,
    filters.applicant,
    filters.status,
    filters.contest,
    filters.customer,
    filters.mrnti,
    filters.trl,
    filters.startYear,
    filters.endYear,
    debouncedSearch,
    selectedRegionId,
    regionNameById,
  ]);

  const {
    data: projectsData,
    isLoading,
    loadError,
    pageMeta,
  } = usePaginatedRemoteData({
    currentPage,
    pageLimit,
    fallbackItems,
    mapItem,
    loadPage,
    errorMessage: 'Не удалось загрузить проекты с backend.',
  });

  return {
    projectsData,
    isLoading,
    loadError,
    projectFilters,
    projectFiltersMeta,
    pageMeta,
  };
};
