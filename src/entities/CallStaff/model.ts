export interface ICallMsg {
  _id: string;
  restaurantId: string;
  tableId: string;
  reason: 'waiter' | 'bill';
  status: 'pending' | 'resolved';
  createdAt: string;
}
