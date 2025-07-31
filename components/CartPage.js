'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useGtag } from '../hooks/useGtag';
import { sendViewCartEvent, sendPageViewEvent } from '../utils/sendAnalyticsEvent';
import { productToGA4Item } from '../lib/products';
import { currencyFormat } from '../utils/helpers';

/**
 * Componente da página do carrinho
 * Implementa tracking de view_cart e permite edição de quantidades
 */
export default function CartPage({ variant: serverVariant }) {
  const [mounted, setMounted] = useState(false);
  const { items, itemCount, totalValue, updateQuantity, removeFromCart } = useCart();
  
  // Usa a variant do servidor
  const variant = serverVariant;
  
  // Inicializa GA4 apenas para grupo controle e após montar
  useGtag(process.env.NEXT_PUBLIC_GA4_ID, mounted ? variant : null);

  useEffect(() => {
    setMounted(true);
    
    if (variant) {
      // Envia evento de visualização da página
      sendPageViewEvent('Carrinho - TênisShop', '/carrinho', variant);

      // Envia evento de visualização do carrinho (se houver itens)
      if (items.length > 0) {
        const ga4Items = items.map(item => productToGA4Item(item, item.quantity));
        sendViewCartEvent(ga4Items, totalValue, variant);
      }
    }
  }, [items, totalValue, variant]);

  /**
   * Handler para atualizar quantidade de item
   */
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  /**
   * Handler para remover item do carrinho
   */
  const handleRemoveItem = (itemId) => {
    if (confirm('Tem certeza que deseja remover este item?')) {
      removeFromCart(itemId);
    }
  };

  // Cálculos adicionais para checkout
  const shipping = totalValue > 200 ? 0 : 15.99;
  const tax = 0; // Sem impostos adicionais neste exemplo
  const finalTotal = totalValue + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <span>Carrinho</span>
        </nav>

        {/* Estado vazio */}
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-8">
            Adicione alguns produtos incríveis ao seu carrinho
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">›</span>
        <span>Carrinho</span>
      </nav>

      {/* Título */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black">
          Carrinho de Compras
        </h1>
        <span className="text-sm text-gray-600">
          {itemCount} {itemCount === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de produtos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            {items.map((item, index) => (
              <div key={item.id} className={`p-6 ${index > 0 ? 'border-t' : ''}`}>
                <div className="flex items-start space-x-4">
                  {/* Imagem do produto */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  {/* Informações do produto */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-black">
                          <Link 
                            href={`/produto/${item.slug}`}
                            className="hover:underline"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.brand} • {item.category}
                        </p>
                        {item.selectedSize && (
                          <p className="text-sm text-gray-600">
                            Tamanho: {item.selectedSize}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Preço e quantidade */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="border border-gray-300 rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="border border-gray-300 rounded-md w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-black">
                          {currencyFormat(item.price * item.quantity)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {currencyFormat(item.price)} cada
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-black mb-4">
              Resumo do Pedido
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{currencyFormat(totalValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Grátis' : currencyFormat(shipping)}
                </span>
              </div>
              {shipping === 0 && totalValue > 200 && (
                <div className="text-sm text-green-600">
                  ✓ Frete grátis acima de R$ 200,00
                </div>
              )}
              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Impostos</span>
                  <span className="font-medium">{currencyFormat(tax)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{currencyFormat(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-black text-white text-center py-3 px-4 rounded-md font-semibold hover:bg-gray-800 transition-colors"
              >
                Finalizar Compra
              </Link>
              <Link
                href="/"
                className="block w-full border border-black text-black text-center py-3 px-4 rounded-md font-semibold hover:bg-gray-50 transition-colors"
              >
                Continuar Comprando
              </Link>
            </div>

            {/* Debug info (remover em produção) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-xs font-bold text-yellow-800 mb-1">Debug Info:</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>Variante A/B: {variant || 'Não definida'}</div>
                  <div>Itens no carrinho: {items.length}</div>
                  <div>Total de itens: {itemCount}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}