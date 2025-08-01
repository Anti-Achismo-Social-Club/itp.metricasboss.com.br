'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Componente para carregar Google Analytics 4
 * Implementação direta com carregamento condicional baseado no experimento A/B:
 * 
 * - Grupo Controle: gtag.js do Google oficial + configuração padrão GA4
 * - Grupo Teste: gtag.js do servidor first-party + cookies duradouros
 */
export default function GtagScript() {
  const [variant, setVariant] = useState(null);
  const [mounted, setMounted] = useState(false);
  const measurementId = process.env.NEXT_PUBLIC_GA4_ID;

  useEffect(() => {
    setMounted(true);
    
    // Lê o cookie ab-group no cliente
    const getAbGroup = () => {
      if (typeof document === 'undefined') return null;
      const cookies = document.cookie.split(';');
      const abCookie = cookies.find(c => c.trim().startsWith('ab-group='));
      return abCookie ? abCookie.split('=')[1].trim() : null;
    };

    setVariant(getAbGroup());
  }, []);

  if (!measurementId) {
    console.warn('[GtagScript] NEXT_PUBLIC_GA4_ID não configurado');
    return null;
  }

  if (!mounted || !variant) {
    return null; // Aguarda montar e determinar variante
  }

  // Define a fonte do gtag.js baseado na variante
  const gtagSource = variant === 'controle' 
    ? `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    : `https://gtm.antiachismosocialclub.com.br/gtag/js?id=${measurementId}`;

  return (
    <>
      {/* Google tag (gtag.js) - Carregamento condicional */}
      <Script
        src={gtagSource}
        strategy="afterInteractive"
      />
      
      {/* Configuração do gtag com lógica do experimento A/B */}
      <Script
        id="gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // Variante já determinada pelo componente
            const variant = '${variant}';
            
            // Configuração base do GA4 (sem custom_map - não é válido no GA4)
            const config = {
              send_page_view: true
            };

            // Experimento A/B: configurações específicas por grupo
            if (variant === 'controle') {
              console.log('[gtag] 🎯 Grupo CONTROLE');
              console.log('[gtag] - Fonte: www.googletagmanager.com (Google oficial)');
              console.log('[gtag] - Cookie _ga tradicional (7 dias no Safari)');
              console.log('[gtag] - Dados: gtag → GA4 direto');
            } else if (variant === 'teste') {
              console.log('[gtag] 🧪 Grupo TESTE');
              console.log('[gtag] - Fonte: gtm.antiachismosocialclub.com.br (first-party)');
              console.log('[gtag] - Cookie FPID duradouro (contorna ITP)');
              console.log('[gtag] - Dados: gtag first-party → GA4');
            }

            // Inicializa o GA4
            gtag('config', '${measurementId}', config);
            
            // Helper global para enviar eventos (disponível em window.sendGAEvent)
            window.sendGAEvent = function(eventName, parameters) {
              if (typeof gtag === 'undefined') {
                console.warn('[sendGAEvent] gtag não disponível');
                return;
              }
              
              // Adiciona a variante a todos os eventos
              const eventParams = {
                ...parameters,
                exp_variant_string: variant || 'undefined'
              };
              
              gtag('event', eventName, eventParams);
              
              if (variant === 'teste') {
                console.log('[gtag] 📤 Evento enviado via first-party:', eventName, eventParams);
              } else {
                console.log('[gtag] 📤 Evento enviado via Google oficial:', eventName, eventParams);
              }
            };

            console.log('[gtag] ✅ Google Analytics 4 inicializado');
          `,
        }}
      />
    </>
  );
}