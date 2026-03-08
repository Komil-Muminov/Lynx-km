export interface ISwipeableItemProps {
  children: React.ReactNode;
  onSwipeAction: () => void;
  actionText?: string;
  actionColor?: string; // e.g. '#ff3b30'
}
