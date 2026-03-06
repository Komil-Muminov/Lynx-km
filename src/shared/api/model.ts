export type TMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IApiError {
  message: string;
  code?: string;
  status?: number;
}
