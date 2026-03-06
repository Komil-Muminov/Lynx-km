export enum ECallType {
  WAITER = 'waiter',
  HOOKAH = 'hookah',
  PAYMENT = 'payment'
}

export interface IStaffCall {
  _id: string;
  restaurantId: string;
  tableId: string;
  type: ECallType;
  status: 'pending' | 'resolved';
  createdAt: string;
}
