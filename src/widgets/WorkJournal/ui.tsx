import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { Card } from '@shared/ui/Card/index.js';
import dayjs from 'dayjs';
import './style.css';

interface IShift {
  _id: string;
  userId: {
    name: string;
    role: string;
  };
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
}

interface IProps {
  restaurantId: string;
}

/**
 * Виджет: Журнал Смен
 * Отображает историю приходов и уходов персонала.
 */
export const WorkJournal = ({ restaurantId }: IProps) => {
  const { data: shifts, isLoading } = useGetQuery<IShift[]>(
    ['shifts', restaurantId],
    `/api/users/shifts/${restaurantId}`
  );

  if (isLoading) {
    return (
      <view className="work-journal">
        <Skeleton height={200} />
      </view>
    );
  }

  const formatDuration = (start: string, end?: string) => {
    if (!end) return 'В процессе...';
    const s = dayjs(start);
    const e = dayjs(end);
    const diffHours = e.diff(s, 'hour');
    const diffMins = e.diff(s, 'minute') % 60;
    return `${diffHours}ч ${diffMins}м`;
  };

  return (
    <view className="work-journal">
      <view className="work-journal__header">
        <text className="work-journal__title">Журнал смен</text>
        <text className="work-journal__subtitle">История активности</text>
      </view>

      <view className="work-journal__list">
        {shifts?.map((shift) => (
          <Card key={shift._id} className="work-journal__item">
            <view className="work-journal__item-main">
              <view className="work-journal__staff-info">
                <text className="work-journal__name">{shift.userId.name}</text>
                <text className="work-journal__role">{shift.userId.role}</text>
              </view>
              <view className={`work-journal__status work-journal__status--${shift.status}`}>
                <text className="work-journal__status-text">
                  {shift.status === 'active' ? 'На смене' : 'Завершена'}
                </text>
              </view>
            </view>

            <view className="work-journal__item-details">
              <view className="work-journal__time-block">
                <text className="work-journal__label">Начало:</text>
                <text className="work-journal__value">
                  {dayjs(shift.startTime).format('DD.MM HH:mm')}
                </text>
              </view>
              <view className="work-journal__time-block">
                <text className="work-journal__label">Длительность:</text>
                <text className="work-journal__value">
                  {formatDuration(shift.startTime, shift.endTime)}
                </text>
              </view>
            </view>
          </Card>
        ))}
        {shifts?.length === 0 && (
          <view className="work-journal__empty">
            <text className="work-journal__empty-text">История смен пуста</text>
          </view>
        )}
      </view>
    </view>
  );
};
