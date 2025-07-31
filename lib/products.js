/**
 * Mock product inventory for the sneaker store A/B experiment
 * Contains 4 sneaker models with placeholder data for testing GA4 tracking
 */

export const products = [
  {
    id: '1',
    slug: 'air-max-revolution',
    name: 'Air Max Revolution',
    price: 299.99,
    image: '/placeholder-sneaker-1.jpg',
    category: 'Running',
    brand: 'SportMax',
    description: 'Tênis de corrida com tecnologia de amortecimento avançada e design moderno.',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    inStock: true
  },
  {
    id: '2',
    slug: 'urban-street-classic',
    name: 'Urban Street Classic',
    price: 199.99,
    image: '/placeholder-sneaker-2.jpg',
    category: 'Casual',
    brand: 'StreetWear',
    description: 'Tênis casual urbano com estilo vintage e conforto para o dia a dia.',
    sizes: ['37', '38', '39', '40', '41', '42', '43'],
    inStock: true
  },
  {
    id: '3',
    slug: 'pro-basketball-elite',
    name: 'Pro Basketball Elite',
    price: 399.99,
    image: '/placeholder-sneaker-3.jpg',
    category: 'Basketball',
    brand: 'CourtKing',
    description: 'Tênis de basquete profissional com suporte superior e tração excepcional.',
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    inStock: true
  },
  {
    id: '4',
    slug: 'eco-runner-sustainable',
    name: 'Eco Runner Sustainable',
    price: 249.99,
    image: '/placeholder-sneaker-4.jpg',
    category: 'Running',
    brand: 'GreenStep',
    description: 'Tênis ecológico feito com materiais reciclados, perfeito para corredores conscientes.',
    sizes: ['36', '37', '38', '39', '40', '41', '42'],
    inStock: false // Um produto fora de estoque para testes
  }
];

/**
 * Busca produto por slug
 * @param {string} slug - Slug do produto
 * @returns {Object|null} - Produto encontrado ou null
 */
export function getProductBySlug(slug) {
  return products.find(product => product.slug === slug) || null;
}

/**
 * Busca produto por ID
 * @param {string} id - ID do produto
 * @returns {Object|null} - Produto encontrado ou null
 */
export function getProductById(id) {
  return products.find(product => product.id === id) || null;
}

/**
 * Retorna produtos em estoque
 * @returns {Array} - Array de produtos disponíveis
 */
export function getAvailableProducts() {
  return products.filter(product => product.inStock);
}

/**
 * Converte produto para formato de item GA4
 * Usado para eventos de e-commerce do Google Analytics
 * @param {Object} product - Objeto do produto
 * @param {number} quantity - Quantidade (opcional, padrão 1)
 * @returns {Object} - Item formatado para GA4
 */
export function productToGA4Item(product, quantity = 1) {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_brand: product.brand,
    price: product.price,
    quantity: quantity
  };
}