import React, { createContext, useState, useCallback, type ReactNode } from 'react';
import { Toast } from '@shared/ui/Toast/index.js';
import type { IToastContext, IToastOptions } from './model.js';

export const ToastContext = createContext<IToastContext | null>(null);

interface IProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: IProps) => {
  const [toastConfig, setToastConfig] = useState<IToastOptions & { visible: boolean }>({
    message: '',
    visible: false,
    type: 'info',
  });

  const showToast = useCallback((options: IToastOptions) => {
    setToastConfig({
      ...options,
      visible: true,
      type: options.type || 'info',
      duration: options.duration || 3000,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const success = (message: string, duration?: number) => showToast({ message, type: 'success', duration });
  const error   = (message: string, duration?: number) => showToast({ message, type: 'error', duration });
  const info    = (message: string, duration?: number) => showToast({ message, type: 'info', duration });

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <Toast 
        message={toastConfig.message}
        visible={toastConfig.visible}
        type={toastConfig.type}
        duration={toastConfig.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};
