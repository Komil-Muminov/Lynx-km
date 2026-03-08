export interface IAdminDashboardScreenProps {
  restaurantId: string;
  onBack: () => void;
}

export interface IAnalyticsData {
  revenue: number;
  tips: number;
  totalOrders: number;
  commission: number;
}
