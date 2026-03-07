import React from 'react';
import dayjs from 'dayjs';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import './ActiveCalls.css';

// Форматируем время относительно текущего момента
const timeAgo = (isoDate: string): string => {
  const diff = dayjs().diff(dayjs(isoDate), 'minute');
  if (diff < 1) return 'только что';
  if (diff < 60) return `${diff} мин назад`;
  return `${Math.floor(diff / 60)} ч назад`;
};

interface ICall {
  _id: string;
  tableId: string;
  type: 'waiter' | 'hookah' | 'payment';
  status: 'pending' | 'resolved';
  createdAt: string;
}

interface IProps {
  restaurantId: string;
}

export const ActiveCalls = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();

  // Полинг — обновляем список вызовов каждые 15 секунд
  const { data: calls, isLoading } = useGetQuery<ICall[]>(
    ['active-calls', restaurantId],
    `/api/calls/restaurant/${restaurantId}`,
    {},
    { refetchInterval: 15000 }
  );

  const resolveMutation = useMutationQuery();

  const handleResolve = (callId: string) => {
    resolveMutation.mutate(
      { url: `/api/calls/${callId}/resolve`, method: 'PUT' },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['active-calls', restaurantId] });
        }
      }
    );
  };

  const getTypeLabel = (type: ICall['type']) => {
    if (type === 'waiter') return '🙋‍♂️ Официант';
    if (type === 'hookah') return '💨 Кальянщик';
    return '💳 Счёт';
  };

  if (isLoading) return <text className="active-calls__loading">Загрузка вызовов...</text>;

  return (
    <view className="active-calls">
      <view className="active-calls__header">
        <text className="active-calls__title">Активные вызовы</text>
        {calls && calls.length > 0 && (
          <view className="active-calls__badge">
            <text className="active-calls__badge-txt">{calls.length}</text>
          </view>
        )}
      </view>
      {!calls || calls.length === 0 ? (
        <text className="active-calls__empty">Вызовов пока нет 👌</text>
      ) : (
        <scroll-view className="active-calls__list" scroll-y>
          {calls.map((call) => (
            <view key={call._id} className="active-calls__item">
              <view className="active-calls__info">
                <text className="active-calls__table">{call.tableId}</text>
                <text className="active-calls__type">{getTypeLabel(call.type)}</text>
                <text className="active-calls__time">
                  {timeAgo(call.createdAt)}
                </text>
              </view>
              <view className="active-calls__action" bindtap={() => handleResolve(call._id)}>
                <text className="active-calls__action-text">Принял</text>
              </view>
            </view>
          ))}
        </scroll-view>
      )}
    </view>
  );
};
