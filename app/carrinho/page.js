import CartPage from '../../components/CartPage';
import { getVariantServer } from '../../lib/server-utils';

/**
 * Página do carrinho de compras
 * Server Component que renderiza Client Component
 */
export default async function Carrinho() {
  const variant = await getVariantServer();
  return <CartPage variant={variant} />;
}

export const metadata = {
  title: 'Carrinho - TênisShop',
  description: 'Revise seus produtos e finalize sua compra',
};