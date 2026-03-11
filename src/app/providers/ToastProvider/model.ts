import type { TToastType } from '@shared/ui/Toast/model.js';

export interface IToastOptions {
  message: string;
  type?: TToastType;
  duration?: number;
}

export interface IToastContext {
  showToast: (options: IToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}
