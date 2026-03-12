import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { _axios } from '../_axios.js';
import type { IApiError } from '../model.js';
import * as Mocks from '../mock.js';

/**
 * Универсальный хук для выполнения GET-запросов с поддержкой моков.
 */
export const useGetQuery = <TData = any>(
  queryKey: unknown[],
  url: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<TData, IApiError>, 'queryKey' | 'queryFn'> & { useMock?: boolean }
) => {
  return useQuery<TData, IApiError>({
    queryKey,
    queryFn: async () => {
      // Режим моков (для демо без бэка)
      if (options?.useMock) {
        await new Promise(resolve => setTimeout(resolve, 500));
        if (url.includes('/api/scan')) return Mocks.MOCK_SCAN_RESULT as TData;
        if (url.includes('/stats/restaurant')) return Mocks.MOCK_MANAGER_STATS as TData;
        if (url.includes('/api/menu')) return Mocks.MOCK_MENU as TData;
        if (url.includes('/api/calls')) return Mocks.MOCK_CALLS as TData;
        if (url.includes('/api/orders/status/')) return Mocks.MOCK_ORDERS[0] as TData; // Один заказ
        if (url.includes('/api/orders')) return Mocks.MOCK_ORDERS as TData; // Массив
      }

      try {
        const response = await _axios.get<TData>(url, { params });
        return response.data;
      } catch (error) {
        console.warn(`API Error for ${url}, switching to mock data.`);
        await new Promise(resolve => setTimeout(resolve, 300));
        if (url.includes('/api/scan')) return Mocks.MOCK_SCAN_RESULT as TData;
        if (url.includes('/stats/restaurant')) return Mocks.MOCK_MANAGER_STATS as TData;
        if (url.includes('/api/menu')) return Mocks.MOCK_MENU as TData;
        if (url.includes('/api/calls')) return Mocks.MOCK_CALLS as TData;
        if (url.includes('/api/orders/status/')) return Mocks.MOCK_ORDERS[0] as TData;
        if (url.includes('/api/orders')) return Mocks.MOCK_ORDERS as TData;
        throw error;
      }
    },
    ...options,
  });
};
