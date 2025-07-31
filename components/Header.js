'use client';

import Link from 'next/link';
import { useCart } from '../contexts/CartContext';

/**
 * Header da aplicação com navegação e badge do carrinho
 * Mostra contador de itens no carrinho em tempo real
 */
export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-black">TênisShop</h1>
          </Link>

          {/* Navegação */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/carrinho" 
              className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Carrinho
            </Link>
          </nav>

          {/* Carrinho com badge */}
          <Link 
            href="/carrinho"
            className="relative inline-flex items-center p-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" 
              />
            </svg>
            
            {/* Badge com contador */}
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}