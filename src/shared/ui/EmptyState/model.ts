/** Пропсы EmptyState */
export interface IEmptyStateProps {
  /** Большой эмодзи или символ иллюстрации */
  icon: string;
  /** Основной заголовок */
  title: string;
  /** Дополнительная подпись (опционально) */
  hint?: string;
  /** Вариант отображения — обычный или ошибка */
  variant?: 'default' | 'error';
}
