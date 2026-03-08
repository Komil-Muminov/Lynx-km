export const getEnvVar = (key: string): string => {
  // В мобильной Lynx среде мы можем использовать import.meta.env
  // или кастомные глобальные переменные Rspeedy (например, process.env)
  // Для безопасности оборачиваем это в функцию
  
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  // Возвращаем дефолты для fallback
  const fallbacks: Record<string, string> = {
    'API_URL': 'http://localhost:5000'
  };
  
  return fallbacks[key] || '';
};
