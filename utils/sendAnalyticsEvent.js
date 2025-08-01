/**
 * Helper unificado para envio de eventos de analytics
 * 
 * Utiliza a função global window.sendGAEvent criada pelo GtagScript
 * Ambos os grupos (controle e teste) usam gtag.js:
 * - Grupo CONTROLE: gtag.js → GA4 direto
 * - Grupo TESTE: gtag.js → GTM Server → GA4
 * 
 * Todos os eventos incluem automaticamente exp_variant_string
 */

/**
 * Envia evento de analytics usando a função global do gtag
 * @param {string} eventName - Nome do evento GA4
 * @param {Object} parameters - Parâmetros do evento
 * @param {string} variant - Variante do experimento ('controle' ou 'teste')
 */
export async function sendAnalyticsEvent(eventName, parameters = {}, variant) {
  if (!variant) {
    console.error('[sendAnalyticsEvent] Variante não fornecida');
    return;
  }

  try {
    // Usa a função global window.sendGAEvent criada pelo GtagScript
    if (typeof window !== 'undefined' && window.sendGAEvent) {
      window.sendGAEvent(eventName, parameters);
    } else {
      console.warn('[sendAnalyticsEvent] window.sendGAEvent não disponível');
    }
  } catch (error) {
    console.error('[sendAnalyticsEvent] Erro ao enviar evento:', error);
  }
}

// Função sendServerSideEvent removida - não é mais necessária
// Agora ambos os grupos usam gtag com configurações diferentes

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