/**
 * useHaptic — обёртка над нативным Haptic API Lynx.
 * Использует lynx.performHapticFeedback если доступно, иначе тихо игнорирует.
 */

type THapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error' | 'warning';

/** Маппинг наших стилей в нативные константы Lynx */
const HAPTIC_MAP: Record<THapticStyle, string> = {
  light:     'impactLight',
  medium:    'impactMedium',
  heavy:     'impactHeavy',
  selection: 'selection',
  success:   'notificationSuccess',
  error:     'notificationError',
  warning:   'notificationWarning',
};

export const useHaptic = () => {
  /**
   * Вызвать вибрацию.
   * @param style — интенсивность/тип
   */
  const trigger = (style: THapticStyle = 'medium') => {
    try {
      // Lynx нативный API
      const nativeType = HAPTIC_MAP[style];
      // @ts-ignore — lynx глобальный объект не типизирован в TS
      if (typeof lynx?.performHapticFeedback === 'function') {
        // @ts-ignore
        lynx.performHapticFeedback(nativeType);
      }
    } catch {
      // В браузере / dev-режиме — тихо игнорируем
    }
  };

  return { trigger };
};
