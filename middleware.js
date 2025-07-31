import { NextResponse } from 'next/server';

/**
 * Middleware para experimento A/B Safari/iOS
 * 
 * Propósito:
 * - Divide tráfego 50/50 entre grupos Controle e Teste
 * - Grupo Controle: GA4 client-side padrão com cookie _ga (7 dias no ITP)
 * - Grupo Teste: Server-side tagging simulado + cookie FPID HTTP-only (~13 meses)
 * 
 * Lógica:
 * 1. Verifica se já existe cookie 'ab-group'
 * 2. Se não existe, sorteia variante (controle/teste) com 50% de chance cada
 * 3. Define cookie 'ab-group' com SameSite=Lax, válido por 30 dias
 * 4. Cookie persiste a variante para futuras visitas do mesmo usuário
 */

export function middleware(request) {
  const response = NextResponse.next();
  
  // Verifica se já existe cookie de grupo A/B
  const existingVariant = request.cookies.get('ab-group');
  
  if (!existingVariant) {
    // Primeira visita: sorteia variante aleatoriamente
    // Math.random() < 0.5 = 50% chance para cada grupo
    const isControlGroup = Math.random() < 0.5;
    const variant = isControlGroup ? 'controle' : 'teste';
    
    // Define cookie com a variante sorteada
    // Configurações do cookie:
    // - SameSite=Lax: Permite envio em navegação cross-site (compatibilidade)
    // - Max-Age=30 dias: Duração do experimento
    // - Path=/: Disponível em todas as páginas do site
    // - HttpOnly=false: Permite acesso via JavaScript no client (para getVariant())
    response.cookies.set('ab-group', variant, {
      maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
      sameSite: 'lax',
      path: '/',
      httpOnly: false // Necessário para leitura client-side
    });
    
    // Log para monitoramento (remover em produção)
    console.log(`[A/B Test] Nova variante atribuída: ${variant}`);
  }
  
  return response;
}

/**
 * Configuração do matcher do middleware
 * Define em quais rotas o middleware deve ser executado
 * 
 * Incluídos:
 * - Todas as páginas principais do site
 * - API routes (exceto /api/track que tem lógica própria)
 * 
 * Excluídos:
 * - Assets estáticos (_next/static/*, /favicon.ico, etc.)
 * - Arquivos de imagem e outros recursos
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)',
  ],
};