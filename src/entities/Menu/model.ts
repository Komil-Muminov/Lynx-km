export interface IMenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

export interface IMenu {
  _id: string;
  restaurantId: string;
  items: IMenuItem[];
}
