/** ID блюда */
export type TMenuItemId = string;

export interface IFavoritesContext {
  favorites: Set<TMenuItemId>;
  toggle: (id: TMenuItemId) => void;
  isFavorite: (id: TMenuItemId) => boolean;
}
