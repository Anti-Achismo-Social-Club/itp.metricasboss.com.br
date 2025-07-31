/**
 * Utilitários gerais para o experimento A/B da loja de tênis
 */

/**
 * Obtém a variante do experimento A/B do cookie
 * Lê o cookie 'ab-group' definido pelo middleware
 * @returns {string|null} - 'controle', 'teste' ou null se não definido
 */
export function getVariant() {
  if (typeof window === 'undefined') {
    return null; // SSR - sem acesso a cookies
  }

  const cookies = document.cookie.split(';');
  const abGroupCookie = cookies.find(cookie => 
    cookie.trim().startsWith('ab-group=')
  );

  if (abGroupCookie) {
    return abGroupCookie.split('=')[1].trim();
  }

  return null;
}

/**
 * Formata valores monetários em Real Brasileiro
 * @param {number} value - Valor numérico
 * @returns {string} - Valor formatado (ex: "R$ 299,99")
 */
export function currencyFormat(value) {
  if (typeof value !== 'number') {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Gera ID único de transação usando timestamp + random
 * Formato: YYYY-NNNNNNNN (ano + 8 dígitos aleatórios)
 * @returns {string} - Transaction ID único
 */
export function generateTransactionId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  
  return `${year}-${randomNum}`;
}

/**
 * Gera UUID v4 simples (para casos que precisem de UUID completo)
 * @returns {string} - UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Debounce function para evitar calls excessivos
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função debounced
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Valida se string é um email válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formata número de CEP brasileiro
 * @param {string} cep - CEP sem formatação
 * @returns {string} - CEP formatado (XXXXX-XXX)
 */
export function formatCEP(cep) {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5)}`;
  }
  return cep;
}

/**
 * Valida CPF brasileiro (apenas formato, não verifica dígitos)
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - true se formato válido
 */
export function isValidCPFFormat(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
}

/**
 * Formata CPF brasileiro
 * @param {string} cpf - CPF sem formatação
 * @returns {string} - CPF formatado (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9)}`;
  }
  return cpf;
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param {string} str - String a ser capitalizada
 * @returns {string} - String capitalizada
 */
export function capitalizeWords(str) {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Trunca texto com reticências
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} - Texto truncado
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}