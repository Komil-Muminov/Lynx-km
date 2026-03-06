import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { _axios } from '../_axios.js';
import type { IApiError, TMethod } from '../model.js';

interface IMutationParams<TVariables> {
  url: string;
  method: TMethod;
  data?: TVariables;
  params?: Record<string, any>;
}

/**
 * Универсальный хук для выполнения мутаций (POST, PUT, PATCH, DELETE).
 * 
 * @param options - Дополнительные опции React Query Mutation (onSuccess, onError и др.).
 */
export const useMutationQuery = <TData = any, TVariables = any>(
  options?: UseMutationOptions<TData, IApiError, IMutationParams<TVariables>>
) => {
  return useMutation<TData, IApiError, IMutationParams<TVariables>>({
    mutationFn: async ({ url, method, data, params }: IMutationParams<TVariables>) => {
      // Игнорируем GET в мутациях согласно правилам
      if (method === 'GET') {
        throw new Error('useMutationQuery does not support GET method. Use useGetQuery instead.');
      }

      const response = await _axios.request<TData>({
        url,
        method,
        data,
        params,
      });

      return response.data;
    },
    ...options,
  });
};
