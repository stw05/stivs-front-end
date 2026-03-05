import { useEffect, useState } from 'react';
import type { FinanceSummary } from '../api/types';
import { ApiError } from '../api/client';
import { financesApi } from '../api/services';

export const useFinanceSummary = () => {
  const [apiSummary, setApiSummary] = useState<FinanceSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadSummary = async () => {
      setIsSummaryLoading(true);
      setSummaryError(null);
      try {
        const summary = await financesApi.summary(undefined, controller.signal);
        setApiSummary(summary);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        const message = error instanceof ApiError ? error.message : 'Не удалось загрузить финансовую сводку с backend.';
        setSummaryError(message);
      } finally {
        setIsSummaryLoading(false);
      }
    };

    void loadSummary();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    apiSummary,
    isSummaryLoading,
    summaryError,
  };
};
