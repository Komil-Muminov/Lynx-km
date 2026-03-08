export interface IMenuSearchProps {
  /** Текущий поисковый запрос */
  value: string;
  /** Колбэк при изменении */
  onChange: (q: string) => void;
}
