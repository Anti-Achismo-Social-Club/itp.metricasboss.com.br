import ThankYouPage from '../../components/ThankYouPage';
import { getVariantServer } from '../../lib/server-utils';

/**
 * Página de confirmação de compra
 * Server Component que renderiza Client Component
 */
export default async function Obrigado() {
  const variant = await getVariantServer();
  return <ThankYouPage variant={variant} />;
}

export const metadata = {
  title: 'Compra Finalizada - TênisShop',
  description: 'Obrigado pela sua compra!',
};