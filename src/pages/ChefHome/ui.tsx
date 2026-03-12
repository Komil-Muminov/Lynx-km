import { KitchenOrders } from '@widgets/KitchenOrders/index.js';
import { ChefSummary } from '@widgets/ChefSummary/index.js';
import { ChefMenuList } from '@widgets/ChefMenuList/index.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import { ErrorBoundary } from '@shared/ui/ErrorBoundary/index.js';
import React, { useState } from 'react';
import './style.css';

export const ChefHome = () => {
  const restaurantId = "65b2a1c9e8d4a3b2c1f0e4d5";
  const [activeTab, setActiveTab] = useState<'orders' | 'summary' | 'menu'>('orders');
  const { trigger } = useHaptic();

  const handleTabChange = (tab: 'orders' | 'summary' | 'menu') => {
    if (tab !== activeTab) {
      trigger('light');
      setActiveTab(tab);
    }
  };

  return (
    <view className="chef-page">
      <view className="chef-page__header">
        <text className="chef-page__title">Экран Кухни (KDS)</text>
        
        <view className="chef-page__tabs">
          <view 
            className={`chef-page__tab ${activeTab === 'orders' ? 'chef-page__tab--active' : ''}`}
            bindtap={() => handleTabChange('orders')}
          >
            <text className={`chef-page__tab-txt ${activeTab === 'orders' ? 'chef-page__tab-txt--active' : ''}`}>По заказам</text>
          </view>
          <view 
            className={`chef-page__tab ${activeTab === 'summary' ? 'chef-page__tab--active' : ''}`}
            bindtap={() => handleTabChange('summary')}
          >
            <text className={`chef-page__tab-txt ${activeTab === 'summary' ? 'chef-page__tab-txt--active' : ''}`}>По блюдам</text>
          </view>
          <view 
            className={`chef-page__tab ${activeTab === 'menu' ? 'chef-page__tab--active' : ''}`}
            bindtap={() => handleTabChange('menu')}
          >
            <text className={`chef-page__tab-txt ${activeTab === 'menu' ? 'chef-page__tab-txt--active' : ''}`}>Стоп-лист</text>
          </view>
        </view>
      </view>
      
      <view className="chef-page__content">
        <ErrorBoundary title="Ошибка загрузки данных кухни">
          {activeTab === 'orders' && <KitchenOrders restaurantId={restaurantId} />}
          {activeTab === 'summary' && <ChefSummary restaurantId={restaurantId} />}
          {activeTab === 'menu' && <ChefMenuList restaurantId={restaurantId} />}
        </ErrorBoundary>
      </view>
      
      <view className="chef-page__footer">
        <text className="chef-page__status">🔥 Жарка идет...</text>
      </view>
    </view>
  );
};

