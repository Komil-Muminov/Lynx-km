import type { ICallMsg } from '@entities/CallStaff/index.js';

/**
 * Интерфейс пропсов виджета ActiveCalls
 */
export interface IActiveCallsProps {
  restaurantId: string;
}

/**
 * Типы для самих вызовов можно было бы хранить тут, 
 * но они уже импортируются из @entities/CallStaff
 */
export type { ICallMsg };
