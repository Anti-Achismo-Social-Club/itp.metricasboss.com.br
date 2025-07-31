import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route para simulação de Server-Side Tagging (sGTM)
 * 
 * Propósito no experimento A/B:
 * - Substitui gtag.js client-side para o grupo TESTE
 * - Emite cookie FPID (First-Party ID) HTTP-only para contornar ITP Safari
 * - Simula envio de dados para servidor Google Tag Manager real
 * 
 * Funcionamento:
 * 1. Recebe eventos de analytics via fetch() do client
 * 2. Gera/mantém cookie FPID com ~13 meses de duração
 * 3. TODO: Reenviar dados para servidor sGTM real em produção
 */

export async function POST(request) {
  try {
    // Parse do body da requisição (dados do evento de analytics)
    const eventData = await request.json();
    
    console.log('[/api/track] Evento recebido:', eventData);
    
    // Gerenciamento do cookie FPID (First-Party ID)
    // Cookie HTTP-only para identificação persistente contornando ITP
    const cookieStore = await cookies();
    let fpid = cookieStore.get('fpid')?.value;
    
    if (!fpid) {
      // Gera novo FPID se não existir
      // Formato similar ao Client ID do GA4: timestamp.random
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000000000);
      fpid = `${timestamp}.${randomNum}`;
      
      console.log('[/api/track] Novo FPID gerado:', fpid);
    }
    
    // Prepara resposta com cookie FPID
    const response = NextResponse.json({ 
      status: 'success',
      message: 'Evento recebido e processado',
      fpid: fpid // Retorna FPID para debug (remover em produção)
    });
    
    // Define cookie FPID se não existir ou precisa renovar
    if (!cookieStore.get('fpid')) {
      response.cookies.set('fpid', fpid, {
        // Configurações do cookie FPID:
        httpOnly: true,          // Não acessível via JavaScript (contorna ITP)
        sameSite: 'lax',         // Compatibilidade cross-site
        // secure: true,         // Apenas HTTPS (descomentado em produção)
        maxAge: 400 * 24 * 60 * 60, // ~13 meses (400 dias)
        path: '/'                // Disponível em todo o site
      });
      
      console.log('[/api/track] Cookie FPID definido');
    }
    
    // ============================================
    // TODO: INTEGRAÇÃO COM SERVER-SIDE GTM REAL
    // ============================================
    
    /*
     * Em produção, implementar envio para servidor sGTM:
     * 
     * 1. Configurar endpoint do Google Tag Manager Server-Side
     * 2. Transformar eventData para formato MP (Measurement Protocol)
     * 3. Incluir FPID como client_id nos dados enviados
     * 4. Implementar retry logic para falhas de rede
     * 5. Adicionar rate limiting e validação de dados
     * 
     * Exemplo de integração:
     * 
     * const sgtmEndpoint = process.env.SGTM_ENDPOINT;
     * const measurementId = process.env.GA4_MEASUREMENT_ID;
     * 
     * const payload = {
     *   client_id: fpid,
     *   events: [{
     *     name: eventData.event_name,
     *     params: {
     *       ...eventData.parameters,
     *       page_location: eventData.page_url,
     *       page_title: eventData.page_title
     *     }
     *   }]
     * };
     * 
     * const sgtmResponse = await fetch(`${sgtmEndpoint}/g/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
     *   method: 'POST',
     *   headers: {
     *     'Content-Type': 'application/json',
     *   },
     *   body: JSON.stringify(payload)
     * });
     * 
     * if (!sgtmResponse.ok) {
     *   console.error('Erro ao enviar para sGTM:', sgtmResponse.statusText);
     * }
     */
    
    // Log temporário para desenvolvimento
    console.log('[/api/track] TODO: Reenviar para servidor sGTM real');
    console.log('[/api/track] Dados que seriam enviados:', {
      fpid: fpid,
      event: eventData.event_name,
      parameters: eventData.parameters,
      timestamp: new Date().toISOString()
    });
    
    return response;
    
  } catch (error) {
    console.error('[/api/track] Erro ao processar evento:', error);
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handler para método GET (opcional, para debug)
 * Retorna informações sobre o status do tracking
 */
export async function GET() {
  const cookieStore = await cookies();
  const fpid = cookieStore.get('fpid')?.value;
  
  return NextResponse.json({
    status: 'ok',
    message: 'Endpoint de tracking ativo',
    fpid_exists: !!fpid,
    fpid: fpid ? fpid.substring(0, 10) + '...' : null // Mascarado para segurança
  });
}