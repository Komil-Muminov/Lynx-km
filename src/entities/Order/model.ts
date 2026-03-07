export interface IOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  restaurantId: string;
  tableId: string;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'paid';
  createdAt: string;
}
