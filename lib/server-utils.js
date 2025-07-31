import { cookies } from 'next/headers';

/**
 * Utilitários server-side para o experimento A/B
 * Funções que devem ser executadas apenas no servidor
 */

/**
 * Obtém a variante do experimento A/B do cookie (server-side)
 * @returns {Promise<string|null>} - 'controle', 'teste' ou null se não definido
 */
export async function getVariantServer() {
  const cookieStore = await cookies();
  const abGroupCookie = cookieStore.get('ab-group');
  
  if (abGroupCookie) {
    return abGroupCookie.value;
  }
  
  return null;
}