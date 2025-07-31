'use client';

import { useEffect } from 'react';

/**
 * Hook para integração com Google Analytics 4 (GA4)
 * 
 * Funcionalidade específica do experimento A/B:
 * - Injeta script gtag.js APENAS para o grupo CONTROLE
 * - Grupo TESTE usa server-side tagging simulado via /api/track
 * 
 * O hook gerencia:
 * 1. Carregamento condicional do script GA4
 * 2. Inicialização do gtag com Measurement ID
 * 3. Configuração automática de parâmetros customizados
 */

/**
 * Carrega e inicializa Google Analytics 4
 * @param {string} measurementId - GA4 Measurement ID (G-XXXXXXXXXX)
 * @param {string} variant - Variante do experimento A/B ('controle' ou 'teste')
 */
export function useGtag(measurementId, variant) {
  useEffect(() => {
    // Garante que só executa no cliente
    if (typeof window === 'undefined') {
      return;
    }

    // Só carrega GA4 para o grupo CONTROLE
    // Grupo TESTE usa server-side tagging simulado
    if (variant !== 'controle') {
      console.log('[useGtag] Grupo teste detectado - GA4 client-side desabilitado');
      return;
    }

    if (!measurementId) {
      console.warn('[useGtag] Measurement ID não fornecido');
      return;
    }

    // Verifica se gtag já foi carregado para evitar duplicação
    if (window.gtag) {
      console.log('[useGtag] gtag já inicializado');
      return;
    }

    console.log('[useGtag] Inicializando GA4 para grupo controle');

    // Cria script tag para carregar gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    
    // Callback executado após carregamento do script
    script.onload = () => {
      // Inicializa dataLayer se não existir
      window.dataLayer = window.dataLayer || [];
      
      // Define função gtag global
      window.gtag = function() {
        window.dataLayer.push(arguments);
      };
      
      // Configura timestamp inicial
      window.gtag('js', new Date());
      
      // Configura GA4 com Measurement ID
      window.gtag('config', measurementId, {
        // Configurações específicas do experimento
        send_page_view: true,
        // Parâmetros customizados podem ser adicionados aqui
        custom_map: {
          'custom_parameter_1': 'exp_variant_string'
        }
      });

      console.log('[useGtag] GA4 inicializado com sucesso');
    };

    script.onerror = () => {
      console.error('[useGtag] Erro ao carregar script do GA4');
    };

    // Adiciona script ao documento
    document.head.appendChild(script);

    // Cleanup: remove script quando componente desmonta
    return () => {
      const existingScript = document.head.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [measurementId, variant]);
}

/**
 * Função auxiliar para enviar eventos GA4 (apenas grupo controle)
 * @param {string} eventName - Nome do evento GA4
 * @param {Object} parameters - Parâmetros do evento
 * @param {string} variant - Variante do experimento
 */
export function sendGtagEvent(eventName, parameters, variant) {
  // Só envia eventos para grupo controle
  if (variant !== 'controle') {
    return;
  }

  if (typeof window !== 'undefined' && window.gtag) {
    // Adiciona exp_variant_string automaticamente a todos os eventos
    const eventParams = {
      ...parameters,
      exp_variant_string: variant
    };

    window.gtag('event', eventName, eventParams);
    console.log(`[gtag] Evento enviado: ${eventName}`, eventParams);
  } else {
    console.warn('[gtag] gtag não está disponível');
  }
}