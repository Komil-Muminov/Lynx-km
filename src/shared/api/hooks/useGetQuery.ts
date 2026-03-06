import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { _axios } from '../_axios.js';
import type { IApiError } from '../model.js';

/**
 * Универсальный хук для выполнения GET-запросов.
 * 
 * @param queryKey - Уникальный ключ запроса для кэширования в React Query.
 * @param url - Относительный или абсолютный URL для запроса.
 * @param params - Объект с query-параметрами.
 * @param options - Дополнительные опции React Query (enabled, retry и др.).
 */
export const useGetQuery = <TData = any>(
  queryKey: unknown[],
  url: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<TData, IApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TData, IApiError>({
    queryKey,
    queryFn: async () => {
      const response = await _axios.get<TData>(url, { params });
      return response.data;
    },
    ...options,
  });
};
