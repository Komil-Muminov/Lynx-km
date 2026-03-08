import React from 'react';
import './style.css';

interface IProps {
  /** Текст под индикатором */
  text?: string;
  /** Активно ли обновление */
  refreshing?: boolean;
}

/**
 * Shared UI: PullToRefresh indicator.
 * Используется внутри <refresh-view> компонента Lynx.
 */
export const PullToRefreshIndicator = ({ text = 'Обновление...', refreshing = false }: IProps) => {
  return (
    <view className="pull-refresh">
      {refreshing && (
        <view className="pull-refresh__spinner" />
      )}
      <text className="pull-refresh__text">{text}</text>
    </view>
  );
};
