'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * Context do carrinho para gerenciar estado global de compras
 * Implementa persistência via cookie 'cart' para sobreviver a refresh
 * Usado no experimento A/B para tracking de eventos de e-commerce
 */

const CartContext = createContext();

// Ações do reducer do carrinho
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

/**
 * Reducer para gerenciar estado do carrinho
 * @param {Object} state - Estado atual do carrinho
 * @param {Object} action - Ação a ser executada
 * @returns {Object} - Novo estado do carrinho
 */
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        // Se o item já existe, aumenta a quantidade
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      } else {
        // Adiciona novo item ao carrinho
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      if (action.payload.quantity <= 0) {
        // Se quantidade é 0 ou negativa, remove o item
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || []
      };

    default:
      return state;
  }
}

// Estado inicial do carrinho
const initialState = {
  items: []
};

/**
 * Salva carrinho no cookie para persistência
 * @param {Array} items - Itens do carrinho
 */
function saveCartToCookie(items) {
  if (typeof window !== 'undefined') {
    const cartData = JSON.stringify(items);
    // Cookie expira em 7 dias, SameSite=Lax para compatibilidade
    document.cookie = `cart=${encodeURIComponent(cartData)}; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; path=/`;
  }
}

/**
 * Carrega carrinho do cookie
 * @returns {Array} - Itens do carrinho ou array vazio
 */
function loadCartFromCookie() {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const cartCookie = cookies.find(cookie => cookie.trim().startsWith('cart='));
    
    if (cartCookie) {
      try {
        const cartData = decodeURIComponent(cartCookie.split('=')[1]);
        return JSON.parse(cartData);
      } catch (error) {
        console.error('Erro ao carregar carrinho do cookie:', error);
        return [];
      }
    }
  }
  return [];
}

/**
 * Provider do contexto do carrinho
 * Gerencia estado global e persistência via cookie
 */
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Carrega carrinho do cookie na inicialização
  useEffect(() => {
    const savedItems = loadCartFromCookie();
    if (savedItems.length > 0) {
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items: savedItems } });
    }
  }, []);

  // Persiste carrinho no cookie sempre que o estado muda
  useEffect(() => {
    saveCartToCookie(state.items);
  }, [state.items]);

  /**
   * Adiciona item ao carrinho
   * @param {Object} product - Produto a ser adicionado
   * @param {number} quantity - Quantidade (opcional, padrão 1)
   */
  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        brand: product.brand,
        quantity
      }
    });
  };

  /**
   * Remove item do carrinho
   * @param {string} productId - ID do produto a ser removido
   */
  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { id: productId }
    });
  };

  /**
   * Atualiza quantidade de um item
   * @param {string} productId - ID do produto
   * @param {number} quantity - Nova quantidade
   */
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity }
    });
  };

  /**
   * Limpa todo o carrinho
   */
  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Cálculos derivados do estado
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalValue = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value = {
    items: state.items,
    itemCount,
    totalValue,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook para acessar o contexto do carrinho
 * @returns {Object} - Métodos e estado do carrinho
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}