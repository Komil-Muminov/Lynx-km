import React from 'react';
import type { IMenuItem } from './model.js';
import './Menu.css';

interface IProps {
  item: IMenuItem;
  onAdd: (item: IMenuItem) => void;
}

export const MenuItemCard = ({ item, onAdd }: IProps) => {
  return (
    <view className="menu-card">
      {item.imageUrl && (
        <image src={item.imageUrl} className="menu-card__image" mode="aspectFill" />
      )}
      <view className="menu-card__info">
        <text className="menu-card__name">{item.name}</text>
        <text className="menu-card__desc">{item.description}</text>
        
        <view className="menu-card__bottom">
          <text className="menu-card__price">{item.price} дирам</text>
          {item.isAvailable ? (
            <view className="menu-card__add-btn" bindtap={() => onAdd(item)}>
              <text className="menu-card__add-text">В корзину</text>
            </view>
          ) : (
            <text className="menu-card__unavailable">Нет в наличии</text>
          )}
        </view>
      </view>
    </view>
  );
};
