export type TToastType = 'success' | 'error' | 'info' | 'warning';

export interface IToastProps {
  message: string;
  visible: boolean;
  type?: TToastType;
  /** Длительность показа в мс (по умолчанию 3000) */
  duration?: number;
  onClose?: () => void;
}

/** Иконки по типу тоста */
export const TOAST_ICONS: Record<TToastType, string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

