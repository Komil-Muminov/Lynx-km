import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { Card } from '@shared/ui/Card/index.js';
import { useHaptic, useToast } from '@shared/lib/hooks/index.js';
import './style.css';

interface ITableQR {
  tableId: string;
  url: string;
}

interface IQRResponse {
  restaurantName: string;
  tables: ITableQR[];
}

interface IProps {
  restaurantId: string;
}

export const QRGenerator = ({ restaurantId }: IProps) => {
  const { trigger } = useHaptic();
  const toast = useToast();

  const { data, isLoading, isError } = useGetQuery<IQRResponse>(
    ['qr-codes', restaurantId],
    `/api/qr/${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  const handlePrint = (tableId: string, url: string) => {
    trigger('medium');
    // В реальном приложении тут был бы вызов системного диалога печати или скачивания PNG
    toast.showToast({
      message: `QR-код для стола №${tableId} готов к печати`,
      type: 'success'
    });
    console.log('Printing QR for:', url);
  };

  if (isLoading) {
    return (
      <view className="qr-gen">
        <text className="qr-gen__title">Генератор QR-кодов</text>
        <view className="qr-gen__grid">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} width="100%" height="120px" borderRadius="16px" />
          ))}
        </view>
      </view>
    );
  }

  if (isError || !data) return null;

  return (
    <view className="qr-gen">
      <view className="qr-gen__header">
        <text className="qr-gen__title">QR-коды столов</text>
        <text className="qr-gen__count">Всего: {data.tables.length}</text>
      </view>

      <view className="qr-gen__grid">
        {data.tables.map((table) => (
          <Card key={table.tableId} className="qr-gen__card">
            <view className="qr-gen__table-icon">
              <text className="qr-gen__table-number">{table.tableId}</text>
            </view>
            <text className="qr-gen__table-label">Столик</text>
            <view 
              className="qr-gen__btn press-effect" 
              bindtap={() => handlePrint(table.tableId, table.url)}
            >
              <text className="qr-gen__btn-text">Печать QR</text>
            </view>
          </Card>
        ))}
      </view>
    </view>
  );
};
