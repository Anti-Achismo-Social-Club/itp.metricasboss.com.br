'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useGtag } from '../hooks/useGtag';
import { sendPageViewEvent } from '../utils/sendAnalyticsEvent';

/**
 * Componente da página de confirmação de compra
 * Mostra detalhes da transação e confirmação de sucesso
 */
export default function ThankYouPage({ variant: serverVariant }) {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transaction_id');
  
  // Usa a variant do servidor
  const variant = serverVariant;
  
  // Inicializa GA4 apenas para grupo controle e após montar
  useGtag(process.env.NEXT_PUBLIC_GA4_ID, mounted ? variant : null);

  useEffect(() => {
    setMounted(true);
    
    if (variant) {
      // Envia evento de visualização da página
      sendPageViewEvent('Obrigado - TênisShop', '/obrigado', variant);
    }
  }, [variant]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">›</span>
        <span>Confirmação</span>
      </nav>

      {/* Conteúdo principal */}
      <div className="text-center">
        {/* Ícone de sucesso */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título principal */}
        <h1 className="text-4xl font-bold text-black mb-4">
          Compra Realizada com Sucesso!
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-gray-600 mb-8">
          Obrigado pela sua confiança. Sua compra foi processada e você receberá um email de confirmação em breve.
        </p>

        {/* Informações da transação */}
        {transactionId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-black mb-3">
              Detalhes da Compra
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Número do Pedido:</span> {transactionId}
              </div>
              <div>
                <span className="font-medium">Data:</span> {new Date().toLocaleDateString('pt-BR')}
              </div>
              <div>
                <span className="font-medium">Status:</span> 
                <span className="text-green-600 font-medium ml-1">Confirmado</span>
              </div>
            </div>
          </div>
        )}

        {/* Próximos passos */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-black mb-3">
            Próximos Passos
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <div className="font-medium">Confirmação por Email</div>
                <div className="text-gray-600">Você receberá um email com os detalhes da compra e código de rastreamento.</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <div className="font-medium">Preparação do Pedido</div>
                <div className="text-gray-600">Seus produtos serão separados e embalados com cuidado.</div>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <div className="font-medium">Envio</div>
                <div className="text-gray-600">O produto será enviado em até 2 dias úteis e chegará em 5-7 dias úteis.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors"
          >
            Continuar Comprando
          </Link>
          <Link
            href="/pedidos"
            className="inline-block border border-black text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors"
          >
            Meus Pedidos
          </Link>
        </div>

        {/* Informações de contato */}
        <div className="mt-12 pt-8 border-t text-center">
          <h4 className="text-lg font-semibold text-black mb-3">
            Precisa de Ajuda?
          </h4>
          <p className="text-gray-600 mb-4">
            Nossa equipe está sempre pronta para ajudar você.
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">WhatsApp:</span> (11) 99999-9999
            </div>
            <div>
              <span className="font-medium">Email:</span> atendimento@tenisshop.com.br
            </div>
            <div>
              <span className="font-medium">Horário:</span> Segunda a Sexta, 9h às 18h
            </div>
          </div>
        </div>

        {/* Experiência do usuário (opcional) */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-black mb-3">
            Avalie Sua Experiência
          </h4>
          <p className="text-gray-600 mb-4">
            Sua opinião é muito importante para nós. Como foi sua experiência de compra?
          </p>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="text-yellow-400 hover:text-yellow-500 transition-colors"
                onClick={() => alert(`Obrigado pela avaliação de ${star} estrelas!`)}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Debug info (remover em produção) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-bold text-yellow-800 mb-2">Debug Info:</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Variante A/B: {variant || 'Não definida'}</div>
              <div>Transaction ID: {transactionId || 'Não fornecido'}</div>
              <div>URL params: {searchParams.toString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}