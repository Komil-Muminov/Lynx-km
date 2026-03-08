export interface IToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}
