# Experimento A/B: GA4 Google Oficial vs First-Party

## Visão Geral

Este projeto implementa um experimento A/B para testar duas abordagens de carregamento do Google Analytics 4 em usuários Safari/iOS, focando em contornar as limitações do ITP (Intelligent Tracking Prevention) através de infraestrutura first-party.

### Objetivo
Comparar a eficácia e durabilidade de cookies entre:
- **Grupo Controle (50%)**: gtag.js do Google oficial
- **Grupo Teste (50%)**: gtag.js servido via domínio first-party

## Status do Projeto
✅ **Implementação Completa** - Experimento funcional e testado  
✅ **Correção de Timing** - Fila de eventos implementada  
✅ **Zero Perda de Dados** - Todos os eventos são capturados

## Arquitetura do Experimento

### Divisão de Tráfego
- **Middleware** (`middleware.js`): Sorteia aleatoriamente usuários na primeira visita
- **Cookie `ab-group`**: Persiste a variante por 30 dias
- **Distribuição**: 50/50 entre `controle` e `teste`

### Grupo Controle
```
Usuário → gtag.js (Google) → Google Analytics 4
Fonte: https://www.googletagmanager.com/gtag/js
```
- Cookie `_ga` com duração limitada (7 dias no Safari por ITP)
- Vulnerável a bloqueadores de anúncios
- Implementação 100% Google tradicional

### Grupo Teste
```
Usuário → gtag.js (First-Party) → Google Analytics 4
Fonte: https://gtm.antiachismosocialclub.com.br/gtag/js
```
- Cookie FPID first-party com duração estendida
- Contorna limitações do ITP
- Resistente a bloqueadores de anúncios

## Implementação Técnica

### 1. Carregamento Condicional do gtag.js
```javascript
// components/GtagScript.js
const gtagSource = variant === 'controle' 
  ? `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  : `https://gtm.antiachismosocialclub.com.br/gtag/js?id=${measurementId}`;

// Configuração padrão GA4 para ambos os grupos
const config = {
  send_page_view: true
};

// exp_variant_string é enviado diretamente como parâmetro dos eventos
```

### 2. Sistema de Fila de Eventos
Para resolver problemas de timing durante o carregamento inicial:

```javascript
// Fila temporária até gtag carregar
if (!window.sendGAEvent) {
  window.pendingGAEvents = window.pendingGAEvents || [];
  window.sendGAEvent = function(eventName, parameters) {
    window.pendingGAEvents.push({ eventName, parameters });
  };
}

// Processa fila quando gtag carrega
if (window.pendingGAEvents && window.pendingGAEvents.length > 0) {
  window.pendingGAEvents.forEach(({ eventName, parameters }) => {
    window.sendGAEvent(eventName, parameters);
  });
  window.pendingGAEvents = [];
}
```

### 3. Eventos Rastreados
Todos os eventos incluem `exp_variant_string` com o valor da variante:

| Momento | Evento | Parâmetros |
|---------|--------|------------|
| Carregamento da home | `view_item_list` | items, item_list_id |
| Clique em produto | `select_item` | items |
| Página de produto | `view_item` | items, value |
| Adicionar ao carrinho | `add_to_cart` | items, value |
| Ver carrinho | `view_cart` | items, value |
| Iniciar checkout | `begin_checkout` | items, value |
| Compra finalizada | `purchase` | transaction_id, items, value |

### 4. Estrutura de Pastas
```
app/
├── page.js                    # Home
├── produto/[slug]/page.js     # Detalhe do produto
├── carrinho/page.js           # Carrinho
├── checkout/page.js           # Checkout
└── obrigado/page.js           # Confirmação

components/
├── GtagScript.js             # Carregamento condicional GA4
├── HomePage.js               # Componentes das páginas
├── ProductPage.js            # ...
└── ...                       # ...
contexts/CartContext.js        # Estado do carrinho
lib/
├── products.js               # Mock de produtos
└── server-utils.js           # Utilitários server-side
utils/
├── helpers.js                # Funções auxiliares
└── sendAnalyticsEvent.js     # Helper de eventos
```

## Como Funciona

### 1. Primeira Visita
1. Usuário acessa o site
2. Middleware verifica se existe cookie `ab-group`
3. Se não existe, sorteia variante (50/50)
4. Define cookie com a variante escolhida

### 2. Carregamento do GA4
1. GtagScript component lê o cookie `ab-group` no cliente
2. Cria fila temporária (`window.pendingGAEvents`) para eventos iniciais
3. Carrega gtag.js da fonte apropriada baseado na variante
4. Processa automaticamente eventos em fila quando gtag fica disponível
5. Configura GA4 com parâmetros padrão para ambos os grupos

### 3. Envio de Eventos
```javascript
// Ambos os grupos usam a mesma API global
window.sendGAEvent('view_item', {
  items: [productData],
  value: product.price
});
// exp_variant_string é adicionado automaticamente

// Logs esperados:
// [sendGAEvent] Adicionando evento à fila: view_item (se gtag não carregou)
// [gtag] Processando X eventos em fila (quando gtag carrega)
// [gtag] 📤 Evento enviado via first-party: view_item (evento processado)
```

### 4. Processamento
- **Controle**: gtag.js do Google oficial → GA4 direto
- **Teste**: gtag.js first-party → GA4 com cookies duradouros
- **Ambos**: Zero perda de eventos graças ao sistema de fila

## Configuração

### Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_GA4_ID=G-VK3S9QL6HY
```

### Requisitos First-Party
1. gtag.js servido do mesmo domínio em `gtm.antiachismosocialclub.com.br`
2. Configuração de proxy/CDN para servir o arquivo original do Google
3. Headers apropriados para caching e performance

## Benefícios da Abordagem First-Party

### 1. Durabilidade de Cookies
- **Google oficial**: 7 dias (Safari ITP)
- **First-party**: Até 2 anos (cookies de mesmo domínio)

### 2. Resistência a Bloqueios
- Contorna bloqueadores de anúncios que filtram domínios Google
- Não é afetado por listas de bloqueio tradicionais
- Scripts servidos do próprio domínio são raramente bloqueados

### 3. Performance e Controle
- Menor latência (servidor geograficamente próximo)
- Cache customizado e otimizado
- Maior controle sobre atualizações e versões

## Análise dos Resultados

### Métricas Principais
1. **Taxa de retenção de usuários**: Comparar % de usuários reconhecidos após 7+ dias
2. **Qualidade dos dados**: Completude de funis de conversão
3. **Durabilidade de sessões**: Tempo médio entre visitas sem perda de ID

### Como Analisar no GA4
1. Usar dimensão personalizada `exp_variant_string`
2. Segmentar relatórios por variante
3. Comparar métricas de engajamento e conversão

## Considerações Importantes

### Privacidade
- Ambas as abordagens respeitam LGPD/GDPR
- Cookies first-party apenas
- Sem compartilhamento cross-site

### Performance
- First-party pode reduzir latência se bem configurado
- Benefício significativo em países com conectividade limitada ao Google
- Cache otimizado melhora carregamento repetido

### Manutenção
- Servidor first-party requer monitoramento
- Necessidade de sincronizar atualizações do gtag.js original
- Custos de infraestrutura de CDN/proxy

## Troubleshooting

### Problemas Comuns e Soluções

#### ❌ Erro: "window.sendGAEvent não disponível"
**Causa**: Eventos sendo chamados antes do gtag carregar  
**Solução**: ✅ Resolvido com sistema de fila - eventos são automaticamente enfileirados e processados

#### ❌ Eventos não aparecem no GA4
**Verificar**:
1. `NEXT_PUBLIC_GA4_ID` está configurado corretamente
2. Console mostra logs `[gtag] 📤 Evento enviado`
3. Dimensão personalizada `exp_variant_string` foi criada no GA4

#### ❌ Hydration mismatch
**Causa**: Diferenças entre server/client rendering  
**Solução**: ✅ Resolvido com `suppressHydrationWarning` e leitura de cookies no cliente

#### 🐛 Debug de Variantes
```javascript
// No console do navegador:
document.cookie.split(';').find(c => c.includes('ab-group'))
// Resultado esperado: " ab-group=controle" ou " ab-group=teste"
```

### Logs de Sucesso Esperados

**Grupo Controle**:
```
[gtag] 🎯 Grupo CONTROLE
[gtag] - Fonte: www.googletagmanager.com (Google oficial)
[gtag] Processando X eventos em fila
[gtag] 📤 Evento enviado via Google oficial: page_view
```

**Grupo Teste**:
```
[gtag] 🧪 Grupo TESTE
[gtag] - Fonte: gtm.antiachismosocialclub.com.br (first-party)
[gtag] Processando X eventos em fila
[gtag] 📤 Evento enviado via first-party: page_view
```

## Próximos Passos

1. **Monitorar por 30-60 dias** para dados significativos
2. **Analisar resultados** por segmento de dispositivo
3. **Decidir implementação** baseada em dados
4. **Considerar expansão** para todos os usuários se positivo

## Recursos Adicionais

- [Documentação GTM Server-Side](https://developers.google.com/tag-platform/tag-manager/server-side)
- [Safari ITP Documentation](https://webkit.org/tracking-prevention/)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)