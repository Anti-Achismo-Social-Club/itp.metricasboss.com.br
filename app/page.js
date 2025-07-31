import HomePage from '../components/HomePage';
import { getVariantServer } from '../lib/server-utils';

/**
 * Página inicial da loja de tênis
 * Server Component que passa dados para Client Component
 */
export default async function Home() {
  const variant = await getVariantServer();
  return <HomePage variant={variant} />;
}
