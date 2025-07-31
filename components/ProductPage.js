'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useGtag } from '../hooks/useGtag';
import { sendViewItemEvent, sendAddToCartEvent, sendPageViewEvent } from '../utils/sendAnalyticsEvent';
import { productToGA4Item } from '../lib/products';
import { currencyFormat } from '../utils/helpers';

/**
 * Componente da página de detalhes do produto
 * Implementa tracking de view_item e add_to_cart
 */
export default function ProductPage({ product, variant: serverVariant }) {
  const [mounted, setMounted] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  // Usa a variant do servidor
  const variant = serverVariant;
  
  // Inicializa GA4 apenas para grupo controle e após montar
  useGtag(process.env.NEXT_PUBLIC_GA4_ID, mounted ? variant : null);

  useEffect(() => {
    setMounted(true);
    
    if (variant) {
      // Envia evento de visualização da página
      sendPageViewEvent(`${product.name} - TênisShop`, `/produto/${product.slug}`, variant);

      // Envia evento de visualização do produto
      const ga4Item = productToGA4Item(product);
      sendViewItemEvent([ga4Item], variant);
    }
  }, [product, variant]);

  /**
   * Handler para adicionar produto ao carrinho
   * Inclui validação de tamanho e tracking de evento
   */
  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Por favor, selecione um tamanho');
      return;
    }

    // Adiciona produto ao carrinho
    const productWithSize = {
      ...product,
      selectedSize,
      id: `${product.id}-${selectedSize}` // ID único por tamanho
    };
    
    addToCart(productWithSize, quantity);

    // Envia evento de analytics
    if (variant) {
      const ga4Item = productToGA4Item(product, quantity);
      const totalValue = product.price * quantity;
      sendAddToCartEvent([ga4Item], totalValue, variant);
    }

    // Feedback visual
    alert(`${product.name} (tamanho ${selectedSize}) adicionado ao carrinho!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">›</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Coluna da imagem */}
        <div className="space-y-4">
          {/* Imagem principal */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {/* Placeholder para imagem real */}
            {/* <Image src={product.image} alt={product.name} fill className="object-cover" /> */}
          </div>

          {/* Galeria de miniaturas (placeholder) */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-50 rounded-md border-2 border-transparent hover:border-blue-500 cursor-pointer">
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna das informações */}
        <div className="space-y-6">
          {/* Título e preço */}
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-2xl font-bold text-black">
                {currencyFormat(product.price)}
              </span>
              <span className="text-sm text-gray-600">
                {product.brand} • {product.category}
              </span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm ${
              product.inStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.inStock ? 'Em estoque' : 'Fora de estoque'}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">
              Descrição
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Seleção de tamanho */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">
              Tamanho
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`border rounded-md py-3 px-4 text-center transition-colors ${
                    selectedSize === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {selectedSize && (
              <p className="text-sm text-gray-600 mt-2">
                Tamanho selecionado: {selectedSize}
              </p>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3">
              Quantidade
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span className="text-lg font-medium w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-3 px-6 rounded-md font-semibold transition-colors ${
                product.inStock
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'Adicionar ao Carrinho' : 'Indisponível'}
            </button>

            <Link
              href="/carrinho"
              className="block w-full py-3 px-6 border border-black rounded-md text-center text-black font-semibold hover:bg-gray-50 transition-colors"
            >
              Ver Carrinho
            </Link>
          </div>

          {/* Valor total */}
          {quantity > 1 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total ({quantity} itens):</span>
                <span className="text-xl font-bold text-black">
                  {currencyFormat(product.price * quantity)}
                </span>
              </div>
            </div>
          )}

          {/* Debug info (remover em produção) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-xs font-bold text-yellow-800 mb-1">Debug Info:</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <div>Variante A/B: {variant || 'Não definida'}</div>
                <div>Produto ID: {product.id}</div>
                <div>Tamanho selecionado: {selectedSize || 'Nenhum'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}