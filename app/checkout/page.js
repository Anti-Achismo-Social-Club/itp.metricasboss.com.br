import CheckoutPage from '../../components/CheckoutPage';
import { getVariantServer } from '../../lib/server-utils';

/**
 * Página de checkout
 * Server Component que renderiza Client Component
 */
export default async function Checkout() {
  const variant = await getVariantServer();
  return <CheckoutPage variant={variant} />;
}

export const metadata = {
  title: 'Checkout - TênisShop',
  description: 'Finalize sua compra com segurança',
};