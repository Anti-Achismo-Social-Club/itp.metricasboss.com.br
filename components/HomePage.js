'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products, productToGA4Item } from '../lib/products';
import { useCart } from '../contexts/CartContext';
import { useGtag } from '../hooks/useGtag';
import { sendViewItemListEvent, sendSelectItemEvent, sendPageViewEvent } from '../utils/sendAnalyticsEvent';
import { currencyFormat } from '../utils/helpers';

/**
 * Componente da página inicial da loja
 * Implementa tracking de view_item_list e select_item para o experimento A/B
 */
export default function HomePage({ variant: serverVariant }) {
  const [mounted, setMounted] = useState(false);
  const { addToCart } = useCart();
  
  // Usa a variant do servidor
  const variant = serverVariant;
  
  // Inicializa GA4 apenas para grupo controle e após montar
  useGtag(process.env.NEXT_PUBLIC_GA4_ID, mounted ? variant : null);

  useEffect(() => {
    setMounted(true);
    
    if (variant) {
      // Envia evento de visualização da página
      sendPageViewEvent('Home - TênisShop', '/', variant);

      // Envia evento de visualização da lista de produtos
      const availableProducts = products.filter(p => p.inStock);
      const ga4Items = availableProducts.map(product => productToGA4Item(product));
      sendViewItemListEvent(ga4Items, variant);
    }
  }, [variant]);

  /**
   * Handler para clique em produto
   * Dispara evento select_item antes de navegar
   */
  const handleProductClick = (product) => {
    if (variant) {
      const ga4Item = productToGA4Item(product);
      sendSelectItemEvent([ga4Item], variant);
    }
  };

  /**
   * Handler para adicionar ao carrinho direto da home
   * Funcionalidade de conveniência com tracking
   */
  const handleAddToCart = (product, e) => {
    e.preventDefault(); // Previne navegação do Link
    e.stopPropagation();
    
    addToCart(product, 1);
    
    // TODO: Implementar evento add_to_cart aqui se necessário
    // sendAddToCartEvent([productToGA4Item(product, 1)], product.price, variant);
  };

  const availableProducts = products.filter(p => p.inStock);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb simples */}
      <nav className="text-sm text-gray-500 mb-4">
        <span>Home</span>
      </nav>

      {/* Banner principal */}
      <section className="bg-black text-white rounded-lg p-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">
            Os Melhores Tênis do Brasil
          </h1>
          <p className="text-xl mb-6 text-gray-100">
            Descubra nossa coleção exclusiva de tênis para todas as ocasiões.
            Qualidade, conforto e estilo em cada passo.
          </p>
          <div className="text-sm bg-white text-black inline-block px-3 py-1 rounded-full font-medium">
            {variant ? `Experimento A/B: Grupo ${variant}` : 'Carregando...'}
          </div>
        </div>
      </section>

      {/* Lista de produtos */}
      <section>
        <h2 className="text-2xl font-bold text-black mb-8">
          Produtos em Destaque
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map((product) => (
            <Link
              key={product.id}
              href={`/produto/${product.slug}`}
              onClick={() => handleProductClick(product)}
              className="group bg-white rounded-lg border border-gray-200 hover:border-black transition-all duration-200 overflow-hidden"
            >
              {/* Imagem do produto */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Placeholder para imagem real */}
                {/* <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-200" /> */}
              </div>

              {/* Informações do produto */}
              <div className="p-4">
                <h3 className="font-semibold text-black mb-1 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {product.brand} • {product.category}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-black">
                    {currencyFormat(product.price)}
                  </span>
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="bg-black text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Produto fora de estoque (exemplo) */}
        {products.some(p => !p.inStock) && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-medium text-black mb-2">
              Produtos em Falta:
            </h3>
            <div className="space-y-2">
              {products.filter(p => !p.inStock).map(product => (
                <div key={product.id} className="text-sm text-gray-600">
                  <span className="font-medium">{product.name}</span> - 
                  <span className="ml-1">Em breve de volta!</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Debug info (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-bold text-yellow-800 mb-2">Debug Info:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Variante A/B: {variant || 'Não definida'}</div>
            <div>GA4 ID: {process.env.NEXT_PUBLIC_GA4_ID || 'Não configurado'}</div>
            <div>Produtos carregados: {products.length}</div>
            <div>Produtos disponíveis: {availableProducts.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}