---
name: lynx-animation-builder
description: "Мастер создания анимаций для React Lynx. Используй этот скилл для написания производительных CSS-анимаций (Keyframes) без использования вебовых библиотек."
---

# Lynx Animation Builder

## Overview
Этот скилл помогает создавать анимации, которые плавно работают на мобильных устройствах в среде React Lynx. Он исключает использование тяжелых JS-библиотек (framer-motion, gsap) в пользу нативных CSS-решений.

## КРИТИЧЕСКИЕ ПРАВИЛА (Соблюдать всегда!)

1. **Только CSS Keyframes**:
   - Анимации должны описываться через `@keyframes` в файле `style.css`.
   - Применяются через свойство `animation` в соответствующих CSS-классах.

2. **Производительность (GPU-friendly)**:
   - Отдавать предпочтение свойствам: `transform` (translate, scale, rotate) и `opacity`.
   - `ЗАПРЕЩЕНО`: Анимировать `width`, `height`, `margin`, `padding`, так как это вызывает пересчет лейаута и тормоза на мобилках.

3. **Именование по БЭМ**:
   - Классы анимаций должны следовать БЭМ. Модификаторы для состояний (например, `--active`, `--visible`).

4. **Запрещенные библиотеки**:
   - Никакого `framer-motion`, `react-spring`, `lottie-react-native` (если не согласовано отдельно).

## Пример реализации:

**style.css**:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card--visible {
  animation: fadeIn 0.3s ease-out forwards;
}
```

**ui.tsx**:
```tsx
<view className={`card ${isVisible ? 'card--visible' : ''}`}>
  <text>Контент с анимацией</text>
</view>
```

## Алгоритм работы:
1. Опиши логику анимации (что и когда должно двигаться/появляться).
2. Создай `@keyframes` в `style.css`.
3. Создай или обнови CSS-классы с нужными таймингами и кривыми безье.
4. В `ui.tsx` добавь логику переключения классов (например, через состояние `useState`).
