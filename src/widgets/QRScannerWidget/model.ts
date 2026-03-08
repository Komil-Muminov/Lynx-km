export interface IQRValidationResult {
  restaurantId: string;
  tableId: string;
}

export interface IQRScannerWidgetProps {
  onScanSuccess: (data: IQRValidationResult) => void;
  onScanError?: (error: string) => void;
}
