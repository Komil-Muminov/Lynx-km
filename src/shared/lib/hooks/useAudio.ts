/**
 * useAudio — хук для проигрывания звуковых уведомлений.
 */
export const useAudio = () => {
  /**
   * Проиграть звук уведомления.
   * @param url — путь к файлу или URL (по умолчанию стандартный звук нового заказа)
   */
  const playNotification = (url: string = 'https://cdn.pixabay.com/audio/2022/03/15/audio_78383a2121.mp3') => {
    try {
      // В LynxJS проигрывание звука обычно идет через нативный мостик.
      // Если это кастомное решение, здесь вызывается lynx.playAudio.
      // Для разработки используем стандартный Web Audio как фоллбек.
      
      // @ts-ignore
      if (typeof lynx?.playAudio === 'function') {
        // @ts-ignore
        lynx.playAudio(url);
      } else {
        // Фоллбек для браузера/симулятора
        const audio = new Audio(url);
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    } catch (error) {
      console.error('Audio play error:', error);
    }
  };

  return { playNotification };
};
