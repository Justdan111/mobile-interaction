import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

export type CartLine = { id: string; qty: number };

type State = {
  favourites: Set<string>;
  cart: CartLine[];
};

type Action =
  | { type: 'toggleFavourite'; id: string }
  | { type: 'addToCart'; id: string; qty: number }
  | { type: 'reset' };

const initial: State = { favourites: new Set(), cart: [] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggleFavourite': {
      // A fresh Set each time — mutating in place would keep the same
      // reference and React would skip the re-render.
      const favourites = new Set(state.favourites);
      if (favourites.has(action.id)) favourites.delete(action.id);
      else favourites.add(action.id);
      return { ...state, favourites };
    }
    case 'addToCart': {
      const existing = state.cart.find((line) => line.id === action.id);
      const cart = existing
        ? state.cart.map((line) =>
            line.id === action.id ? { ...line, qty: line.qty + action.qty } : line,
          )
        : [...state.cart, { id: action.id, qty: action.qty }];
      return { ...state, cart };
    }
    case 'reset':
      return { favourites: new Set(), cart: [] };
  }
}

type Store = {
  favourites: Set<string>;
  cart: CartLine[];
  cartCount: number;
  isFavourite: (id: string) => boolean;
  toggleFavourite: (id: string) => void;
  addToCart: (id: string, qty: number) => void;
  reset: () => void;
};

const StoreContext = createContext<Store | null>(null);

/**
 * Session state only — favourites and the cart live for as long as the app is
 * open and are deliberately not persisted. There is no checkout behind any of
 * this; it exists so the hearts, the stepper and the drawer's cart badge
 * actually do something.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  const isFavourite = useCallback(
    (id: string) => state.favourites.has(id),
    [state.favourites],
  );

  const value = useMemo<Store>(
    () => ({
      favourites: state.favourites,
      cart: state.cart,
      cartCount: state.cart.reduce((sum, line) => sum + line.qty, 0),
      isFavourite,
      toggleFavourite: (id) => dispatch({ type: 'toggleFavourite', id }),
      addToCart: (id, qty) => dispatch({ type: 'addToCart', id, qty }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state.favourites, state.cart, isFavourite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}
