---
name: api-integration
description: "Строго использовать этот скилл при любой работе с сетью, API запросами и интеграцией фронтенда с бэкендом. Отвечает за правильный импорт и использование хуков."
---

# API Integration & Network Requests

## Overview
Скилл для унификации работы с сетью в проекте Lynx. Проект использует строгие правила для выполнения HTTP-запросов и кэширования серверного состояния.

## КРИТИЧЕСКИЕ ПРАВИЛА (Соблюдать всегда!)

1. **ЗАПРЕЩЕНО ИСПОЛЬЗОВАТЬ**:
   - Нативный `fetch`.
   - Библиотеку `axios` напрямую (`import axios from 'axios'`).

2. **РАЗРЕШЕНО (и обязательно) ИСПОЛЬЗОВАТЬ**:
   - Преднастроенный инстанс `_axios` из `@shared/api`.
   - TanStack Query (React Query) для управления состоянием.
   - Кастомные хуки из `@shared/api/hooks`:
     - `useGetQuery` — для всех GET-запросов.
     - `useMutationQuery` — для всех POST/PUT/PATCH/DELETE-запросов.

3. **Отсутствие хуков вне разрешенных мест**:
   - `ЗАПРЕЩЕНО` создавать свои хуки для API внутри папок: `components`, `widgets`, `features`, `layout`, `Navbar`, `pages`, `entities`, `shared/lib/hooks/`.
   - Вызовы API всегда инициализируются на уровне **Widget** (он тянет API и прокидывает данные вниз).

## Чек-лист по созданию API запроса (Фронтенд):
1. Убедись, что ты находишься в модуле слоя **Widget** или слоя **Shared** (в отведенных местах для API).
2. Импортируй нужный хук:
   ```ts
   import { useGetQuery, useMutationQuery } from '@shared/api/hooks';
   ```
3. Импортируй конфигурацию / URL или инстанс (если нужен кастомный вызов внутри хука):
   ```ts
   import { _axios } from '@shared/api';
   ```
4. Реализуй вызов строго через `useGetQuery` или `useMutationQuery`, передавая им необходимые React Query ключи (`queryKey`) и функции-фетчеры с использованием `_axios`.

Пример правильного запроса:
```ts
// Внутри виджета
const { data, isLoading } = useGetQuery(
   ['my-entity-list'],
   () => _axios.get('/api/v1/entities').then(res => res.data)
);
```
