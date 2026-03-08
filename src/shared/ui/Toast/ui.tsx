import React, { useEffect } from 'react';
import type { IToastProps } from './model.js';
import './style.css';

export const Toast = ({ message, visible, type = 'info', onClose }: IToastProps) => {
  useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <view className={`toast toast--${type} ${visible ? 'toast--visible' : ''}`}>
      <text className="toast__text">{message}</text>
    </view>
  );
};
