import { sendGtagEvent } from '../hooks/useGtag';

/**
 * Helper unificado para envio de eventos de analytics
 * 
 * Gerencia automaticamente a diferença entre grupos do experimento A/B:
 * - Grupo CONTROLE: Envia via gtag.js (client-side GA4)
 * - Grupo TESTE: Envia via fetch para /api/track (server-side simulado)
 * 
 * Todos os eventos incluem automaticamente exp_variant_string
 */

/**
 * Envia evento de analytics baseado na variante do experimento
 * @param {string} eventName - Nome do evento GA4
 * @param {Object} parameters - Parâmetros do evento
 * @param {string} variant - Variante do experimento ('controle' ou 'teste')
 */
export async function sendAnalyticsEvent(eventName, parameters = {}, variant) {
  if (!variant) {
    console.error('[sendAnalyticsEvent] Variante não fornecida');
    return;
  }

  // Adiciona exp_variant_string a todos os eventos
  const eventParams = {
    ...parameters,
    exp_variant_string: variant
  };

  try {
    if (variant === 'controle') {
      // Grupo CONTROLE: Usa gtag.js tradicional
      sendGtagEvent(eventName, eventParams, variant);
      
    } else if (variant === 'teste') {
      // Grupo TESTE: Envia para servidor via /api/track
      await sendServerSideEvent(eventName, eventParams);
      
    } else {
      console.warn(`[sendAnalyticsEvent] Variante desconhecida: ${variant}`);
    }
  } catch (error) {
    console.error('[sendAnalyticsEvent] Erro ao enviar evento:', error);
  }
}

/**
 * Envia evento para o endpoint server-side (/api/track)
 * Usado exclusivamente pelo grupo TESTE
 * @param {string} eventName - Nome do evento
 * @param {Object} parameters - Parâmetros do evento
 */
async function sendServerSideEvent(eventName, parameters) {
  try {
    const payload = {
      event_name: eventName,
      parameters: parameters,
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_title: typeof window !== 'undefined' ? document.title : '',
      timestamp: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : ''
    };

    const response = await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[Server-side] Evento enviado: ${eventName}`, parameters);
    
    return result;
  } catch (error) {
    console.error('[Server-side] Erro ao enviar evento:', error);
    throw error;
  }
}

// ============================================
// EVENTOS ESPECÍFICOS DE E-COMMERCE
// ============================================

/**
 * Evento: Visualização de lista de produtos (home page)
 * @param {Array} items - Lista de produtos visualizados
 * @param {string} variant - Variante do experimento
 */
export function sendViewItemListEvent(items, variant) {
  sendAnalyticsEvent('view_item_list', {
    item_list_id: 'homepage_products',
    item_list_name: 'Produtos em Destaque',
    items: items
  }, variant);
}

/**
 * Evento: Clique em produto (seleção de item)
 * @param {Array} items - Produto clicado (array com 1 item)
 * @param {string} variant - Variante do experimento
 */
export function sendSelectItemEvent(items, variant) {
  sendAnalyticsEvent('select_item', {
    item_list_id: 'homepage_products',
    item_list_name: 'Produtos em Destaque',
    items: items
  }, variant);
}

/**
 * Evento: Visualização de produto individual
 * @param {Array} items - Produto visualizado (array com 1 item)
 * @param {string} variant - Variante do experimento
 */
export function sendViewItemEvent(items, variant) {
  sendAnalyticsEvent('view_item', {
    currency: 'BRL',
    value: items[0]?.price || 0,
    items: items
  }, variant);
}

/**
 * Evento: Adição ao carrinho
 * @param {Array} items - Produtos adicionados
 * @param {number} value - Valor total
 * @param {string} variant - Variante do experimento
 */
export function sendAddToCartEvent(items, value, variant) {
  sendAnalyticsEvent('add_to_cart', {
    currency: 'BRL',
    value: value,
    items: items
  }, variant);
}

/**
 * Evento: Visualização do carrinho
 * @param {Array} items - Produtos no carrinho
 * @param {number} value - Valor total
 * @param {string} variant - Variante do experimento
 */
export function sendViewCartEvent(items, value, variant) {
  sendAnalyticsEvent('view_cart', {
    currency: 'BRL',
    value: value,
    items: items
  }, variant);
}

/**
 * Evento: Início do checkout
 * @param {Array} items - Produtos no checkout
 * @param {number} value - Valor total
 * @param {string} variant - Variante do experimento
 */
export function sendBeginCheckoutEvent(items, value, variant) {
  sendAnalyticsEvent('begin_checkout', {
    currency: 'BRL',
    value: value,
    items: items
  }, variant);
}

/**
 * Evento: Compra finalizada
 * @param {string} transactionId - ID único da transação
 * @param {Array} items - Produtos comprados
 * @param {number} value - Valor total
 * @param {number} tax - Impostos (opcional)
 * @param {number} shipping - Frete (opcional)
 * @param {string} variant - Variante do experimento
 */
export function sendPurchaseEvent(transactionId, items, value, tax = 0, shipping = 0, variant) {
  sendAnalyticsEvent('purchase', {
    transaction_id: transactionId,
    currency: 'BRL',
    value: value,
    tax: tax,
    shipping: shipping,
    items: items
  }, variant);
}

/**
 * Evento: Visualização de página
 * Enviado automaticamente em cada mudança de rota
 * @param {string} pageTitle - Título da página
 * @param {string} pagePath - Caminho da página
 * @param {string} variant - Variante do experimento
 */
export function sendPageViewEvent(pageTitle, pagePath, variant) {
  sendAnalyticsEvent('page_view', {
    page_title: pageTitle,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
    page_path: pagePath
  }, variant);
}