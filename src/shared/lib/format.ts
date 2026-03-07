/**
 * Форматирует цену с указанием валюты (сомони)
 * @param amount Сумма
 * @param useShort Использовать сокращение "с." вместо "сомони"
 */
export const formatPrice = (amount: number, useShort: boolean = false): string => {
  const currency = useShort ? 'с.' : 'сомони';
  return `${amount} ${currency}`;
};
