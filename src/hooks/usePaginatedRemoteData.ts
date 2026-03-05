import { useEffect, useState } from 'react';
import type { PaginationMeta } from '../api/types';
import { ApiError } from '../api/client';

interface PaginatedResponseLike<TItem> {
  items: TItem[];
  meta: PaginationMeta;
}

interface UsePaginatedRemoteDataParams<TIn, TOut> {
  currentPage: number;
  pageLimit: number;
  fallbackItems: TOut[];
  mapItem: (item: TIn) => TOut;
  loadPage: (signal: AbortSignal) => Promise<PaginatedResponseLike<TIn>>;
  errorMessage: string;
}

export const usePaginatedRemoteData = <TIn, TOut>({
  currentPage,
  pageLimit,
  fallbackItems,
  mapItem,
  loadPage,
  errorMessage,
}: UsePaginatedRemoteDataParams<TIn, TOut>) => {
  const [data, setData] = useState<TOut[]>(fallbackItems);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<PaginationMeta>({
    page: 1,
    limit: pageLimit,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const payload = await loadPage(controller.signal);
        setData(payload.items.map((item) => mapItem(item)));
        setPageMeta(payload.meta);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        const message = error instanceof ApiError ? error.message : errorMessage;
        setLoadError(message);
        const fallbackTotal = fallbackItems.length;
        const fallbackTotalPages = Math.ceil(fallbackTotal / pageLimit);
        const start = (currentPage - 1) * pageLimit;
        setData(fallbackItems.slice(start, start + pageLimit));
        setPageMeta({
          page: currentPage,
          limit: pageLimit,
          total: fallbackTotal,
          totalPages: fallbackTotalPages,
          hasNextPage: currentPage < fallbackTotalPages,
          hasPrevPage: currentPage > 1,
        });
      } finally {
        setIsLoading(false);
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [currentPage, pageLimit, fallbackItems, mapItem, loadPage, errorMessage]);

  return {
    data,
    isLoading,
    loadError,
    pageMeta,
  };
};
