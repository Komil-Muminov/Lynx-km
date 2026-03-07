import React, { useState } from 'react';
import { KitchenOrders } from '@widgets/KitchenOrders/index.js';
import { ChefSummary } from '@widgets/ChefSummary/index.js';
import './ChefHome.css';

export const ChefHome = () => {
  const restaurantId = "65b2a1c9e8d4a3b2c1f0e4d5";
  const [activeTab, setActiveTab] = useState<'orders' | 'summary'>('orders');

  return (
    <view className="chef-page">
      <view className="chef-page__header">
        <text className="chef-page__title">Экран Кухни (KDS)</text>
        
        <view className="chef-page__tabs">
          <view 
            className={`chef-page__tab ${activeTab === 'orders' ? 'chef-page__tab--active' : ''}`}
            bindtap={() => setActiveTab('orders')}
          >
            <text className={`chef-page__tab-txt ${activeTab === 'orders' ? 'chef-page__tab-txt--active' : ''}`}>По заказам</text>
          </view>
          <view 
            className={`chef-page__tab ${activeTab === 'summary' ? 'chef-page__tab--active' : ''}`}
            bindtap={() => setActiveTab('summary')}
          >
            <text className={`chef-page__tab-txt ${activeTab === 'summary' ? 'chef-page__tab-txt--active' : ''}`}>По блюдам (сводка)</text>
          </view>
        </view>
      </view>
      
      <view className="chef-page__content">
        {activeTab === 'orders' 
          ? <KitchenOrders restaurantId={restaurantId} />
          : <ChefSummary restaurantId={restaurantId} />
        }
      </view>
      
      <view className="chef-page__footer">
        <text className="chef-page__status">🔥 Жарка идет...</text>
      </view>
    </view>
  );
};

