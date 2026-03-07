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
      // Если включен режим моков, возвращаем данные из файла mock.ts
      if (options?.useMock) {
        if (url.includes('/api/menu')) return Mocks.MOCK_MENU as TData;
        if (url.includes('/api/calls')) return Mocks.MOCK_CALLS as TData;
        if (url.includes('/api/orders')) return Mocks.MOCK_ORDERS as TData;
      }

      try {
        const response = await _axios.get<TData>(url, { params });
        return response.data;
      } catch (error) {
        // Если запрос упал (например, нет связи с бэком), возвращаем моки как fallback для демо
        console.warn(`API Error for ${url}, switching to mock data.`);
        if (url.includes('/api/menu')) return Mocks.MOCK_MENU as TData;
        if (url.includes('/api/calls')) return Mocks.MOCK_CALLS as TData;
        if (url.includes('/api/orders')) return Mocks.MOCK_ORDERS as TData;
        throw error;
      }
    },
    ...options,
  });
};
