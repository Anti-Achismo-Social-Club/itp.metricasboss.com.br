'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useGtag } from '../hooks/useGtag';
import { sendBeginCheckoutEvent, sendPurchaseEvent, sendPageViewEvent } from '../utils/sendAnalyticsEvent';
import { productToGA4Item } from '../lib/products';
import { currencyFormat, generateTransactionId, isValidEmail, formatCEP, formatCPF } from '../utils/helpers';

/**
 * Componente da página de checkout
 * Implementa tracking de begin_checkout e purchase
 */
export default function CheckoutPage({ variant: serverVariant }) {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, totalValue, clearCart } = useCart();
  const router = useRouter();
  
  // Usa a variant do servidor
  const variant = serverVariant;
  
  // Inicializa GA4 apenas para grupo controle e após montar
  useGtag(process.env.NEXT_PUBLIC_GA4_ID, mounted ? variant : null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    cpf: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    paymentMethod: 'credit'
  });

  // Cálculos
  const shipping = totalValue > 200 ? 0 : 15.99;
  const tax = 0;
  const finalTotal = totalValue + shipping + tax;

  useEffect(() => {
    setMounted(true);
    
    // Redireciona se carrinho estiver vazio
    if (items.length === 0) {
      router.push('/carrinho');
      return;
    }

    if (variant) {
      // Envia evento de visualização da página
      sendPageViewEvent('Checkout - TênisShop', '/checkout', variant);

      // Envia evento de início do checkout
      const ga4Items = items.map(item => productToGA4Item(item, item.quantity));
      sendBeginCheckoutEvent(ga4Items, finalTotal, variant);
    }
  }, [items, finalTotal, router, variant]);

  /**
   * Handler para mudanças no formulário
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação automática para alguns campos
    let formattedValue = value;
    if (name === 'cep') {
      formattedValue = formatCEP(value);
    } else if (name === 'cpf') {
      formattedValue = formatCPF(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  /**
   * Validação do formulário
   */
  const validateForm = () => {
    const required = ['email', 'firstName', 'lastName', 'cpf', 'phone', 'cep', 'address', 'number', 'city', 'state'];
    
    for (const field of required) {
      if (!formData[field].trim()) {
        alert(`Por favor, preencha o campo ${field}`);
        return false;
      }
    }

    if (!isValidEmail(formData.email)) {
      alert('Por favor, insira um email válido');
      return false;
    }

    return true;
  };

  /**
   * Handler para finalizar compra
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Simula processamento da compra (2-3 segundos)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Gera ID da transação
      const transactionId = generateTransactionId();

      // Envia evento de compra finalizada
      if (variant) {
        const ga4Items = items.map(item => productToGA4Item(item, item.quantity));
        sendPurchaseEvent(transactionId, ga4Items, finalTotal, tax, shipping, variant);
      }

      // Limpa carrinho
      clearCart();

      // Redireciona para página de obrigado
      router.push(`/obrigado?transaction_id=${transactionId}`);

    } catch (error) {
      console.error('Erro ao processar compra:', error);
      alert('Erro ao processar compra. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/carrinho" className="hover:text-gray-700">Carrinho</Link>
        <span className="mx-2">›</span>
        <span>Checkout</span>
      </nav>

      {/* Título */}
      <h1 className="text-3xl font-bold text-black mb-8">
        Finalizar Compra
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Formulário */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações de contato */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Informações de Contato
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço de entrega */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Endereço de Entrega
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    CEP *
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                    maxLength="9"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Estado *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PR">Paraná</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="SC">Santa Catarina</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Método de pagamento */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-black mb-4">
                Método de Pagamento
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit"
                    checked={formData.paymentMethod === 'credit'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Cartão de Crédito</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={formData.paymentMethod === 'pix'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>PIX (5% de desconto)</span>
                </label>
              </div>
            </div>

            {/* Botão de finalizar */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-md font-semibold text-lg transition-colors ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isProcessing ? 'Processando...' : `Finalizar Compra - ${currencyFormat(finalTotal)}`}
            </button>
          </form>
        </div>

        {/* Resumo do pedido */}
        <div>
          <div className="bg-white rounded-lg border p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-black mb-4">
              Resumo do Pedido
            </h3>

            {/* Produtos */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-600">
                      Qtd: {item.quantity} {item.selectedSize && `• Tam: ${item.selectedSize}`}
                    </div>
                  </div>
                  <div className="font-medium">
                    {currencyFormat(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currencyFormat(totalValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{shipping === 0 ? 'Grátis' : currencyFormat(shipping)}</span>
              </div>
              {formData.paymentMethod === 'pix' && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto PIX (5%)</span>
                  <span>-{currencyFormat(finalTotal * 0.05)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>
                  {formData.paymentMethod === 'pix' 
                    ? currencyFormat(finalTotal * 0.95)
                    : currencyFormat(finalTotal)
                  }
                </span>
              </div>
            </div>

            {/* Debug info (remover em produção) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="text-xs font-bold text-yellow-800 mb-1">Debug Info:</h4>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>Variante A/B: {variant || 'Não definida'}</div>
                  <div>Itens: {items.length}</div>
                  <div>Processando: {isProcessing ? 'Sim' : 'Não'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}