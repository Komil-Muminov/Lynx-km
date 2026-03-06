import type { IMenuItem } from '@entities/Menu/index.js';

export interface ICartItem {
  menuItem: IMenuItem;
  quantity: number;
}
