import { getProductBySlug } from '../../../lib/products';
import { notFound } from 'next/navigation';
import ProductPage from '../../../components/ProductPage';
import { getVariantServer } from '../../../lib/server-utils';

/**
 * Página de detalhes do produto (Server Component)
 * Busca produto por slug e renderiza componente client
 */
export default async function Product({ params }) {
  const product = getProductBySlug(params.slug);
  const variant = await getVariantServer();

  if (!product) {
    notFound();
  }

  return <ProductPage product={product} variant={variant} />;
}

/**
 * Gera metadata dinâmica para SEO
 */
export async function generateMetadata({ params }) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Produto não encontrado',
    };
  }

  return {
    title: `${product.name} - TênisShop`,
    description: product.description,
  };
}