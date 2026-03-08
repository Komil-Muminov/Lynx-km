import React, { useCallback, useState } from 'react';
import type { IQRScannerWidgetProps } from './model.js';
import './style.css';

export const QRScannerWidget = ({ onScanSuccess, onScanError }: IQRScannerWidgetProps) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleMockScan = useCallback(() => {
    setIsScanning(true);
    // Имитация задержки камеры и сканирования
    setTimeout(() => {
      setIsScanning(false);
      // Демо-данные из "зашифрованного" QR
      onScanSuccess({
        restaurantId: '65f0a1b2c3d4e5f600000001', // Моковый ID
        tableId: 'table-7'
      });
    }, 1500);
  }, [onScanSuccess]);

  return (
    <view className="qr-scanner">
      <text className="qr-scanner__title">Сканирование стола</text>
      <text className="qr-scanner__subtitle">Наведите камеру на QR-код, расположенный на вашем столике</text>
      
      <view className="qr-scanner__camera-mock">
        {isScanning && <view className="qr-scanner__scan-line" />}
        <text className="qr-scanner__mock-placeholder">
          {isScanning ? 'Идет сканирование...' : 'Область камеры'}
        </text>
      </view>

      <view className="qr-scanner__mock-btn press-effect" bindtap={handleMockScan}>
        <text className="qr-scanner__mock-btn-text">Сгенерировать скан (Демо)</text>
      </view>
    </view>
  );
};
