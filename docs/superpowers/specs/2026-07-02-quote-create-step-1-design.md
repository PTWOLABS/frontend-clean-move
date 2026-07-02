# Design: Criacao de orcamento - Step 1 cliente e veiculo

## Contexto

O modulo de orcamentos precisa iniciar a UI de criacao de um novo orcamento. O endpoint esperado recebe cliente, veiculo, servicos, opcoes de pagamento e dados complementares, mas este recorte cobre apenas o primeiro step: identificacao de cliente e veiculo.

O projeto usa Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack React Query, React Hook Form e Zod. A UI deve seguir o padrao existente: componentes shadcn, tokens do tema, cards/superficies com borda sutil, mobile-first e sem duplicar regras de negocio do backend.

## Decisoes aprovadas

- O fluxo sera uma rota propria: `/quotes/new`.
- A estrutura sera hibrida responsiva:
  - mobile em coluna unica, com header compacto, progresso e barra inferior fixa;
  - desktop com a mesma experiencia melhorada para duas colunas, usando progresso/resumo lateral e formulario no painel principal.
- O primeiro step usa busca como caminho principal e campos manuais como fallback.
- Cliente e veiculo seguem o mesmo padrao:
  - se um registro existente for selecionado, campos sao preenchidos e ficam em modo somente leitura;
  - se nenhum registro for selecionado, campos ficam editaveis para cadastro rapido;
  - payload envia apenas `customerId`/`vehicleId` quando houver selecao existente.

## Escopo deste recorte

### Incluido

- Criar a rota `/quotes/new`.
- Criar a estrutura visual do wizard para 3 steps:
  1. Cliente e veiculo;
  2. Servicos;
  3. Pagamento e revisao.
- Implementar apenas a UI e comportamento do step 1.
- Criar schema/form state necessario para o step 1 e base do wizard.
- Criar validacao minima para avancar:
  - precisa haver `customerId` ou `customer.name`;
  - veiculo e opcional.
- Preparar o payload parcial do step 1 sem chamar o endpoint final neste recorte.

### Fora de escopo

- Implementar selecao de servicos.
- Implementar pagamento, termos, vencimento e revisao final.
- Enviar o POST de criacao do orcamento.
- Implementar regras de negocio no frontend.
- Criar endpoints novos no backend.

## Layout e UX

### Mobile

A tela mobile deve ser o ponto de partida do design.

- Header superior com botao de voltar, titulo `Novo orcamento` e indicador visual de progresso.
- Conteudo com titulo do step: `Cliente e veiculo`.
- Texto curto de apoio: buscar cliente/veiculo existente ou preencher dados manualmente.
- Secao `Cliente` primeiro.
- Secao `Veiculo` abaixo.
- Barra inferior fixa com:
  - `Voltar` retornando para `/quotes` no step 1;
  - `Proximo` como acao primaria.
- Conteudo deve ter padding inferior suficiente para nao ficar escondido atras da barra fixa.

### Desktop

No desktop, o fluxo continua sendo o mesmo componente.

- Container central com largura maxima adequada ao app.
- Layout em duas colunas:
  - lateral compacta com progresso dos steps e possivel resumo do que ja foi selecionado;
  - conteudo principal com o formulario.
- Acoes ficam no rodape do painel principal, alinhadas a direita no desktop.

## Step 1: Cliente

### Busca

O topo da secao deve ter um `Combobox`/campo de busca com texto sugerido:

`Buscar cliente por nome, CPF/CNPJ ou telefone`

Estados esperados:

- carregando: indicar busca em andamento;
- vazio: `Nenhum cliente encontrado.`;
- erro: mensagem curta com possibilidade de tentar novamente se o padrao local permitir.

### Cliente selecionado

Quando um cliente existente for selecionado:

- preencher:
  - nome completo;
  - CPF/CNPJ;
  - telefone/WhatsApp;
  - e-mail;
- campos ficam em modo somente leitura, nao apenas disabled, para manter legibilidade e acessibilidade;
- mostrar estado visual `Cliente selecionado`;
- oferecer acao para remover/trocar selecao.

Payload esperado nesta condicao:

```ts
{
  customerId: string;
}
```

Nao enviar `customer` quando `customerId` estiver definido.

### Cadastro rapido de cliente

Quando nenhum cliente estiver selecionado:

- nome completo editavel e obrigatorio;
- CPF/CNPJ opcional;
- telefone/WhatsApp opcional;
- e-mail opcional na UI, mesmo nao estando no schema original informado; o envio final deve depender do contrato real do backend;
- endereco fica fora deste primeiro recorte, salvo se o backend exigir depois.

Payload esperado nesta condicao:

```ts
{
  customer: {
    name: string;
    phone?: string | null;
    cpfCnpj?: string | null;
  }
}
```

## Step 1: Veiculo

### Busca

A secao de veiculo deve seguir o mesmo padrao do cliente.

Texto sugerido:

`Buscar veiculo por placa ou modelo`

Quando houver cliente selecionado, a busca de veiculos deve listar veiculos desse cliente. Se nao houver cliente selecionado, a busca de veiculo fica desabilitada e os campos manuais ficam disponiveis.

### Veiculo selecionado

Quando um veiculo existente for selecionado:

- preencher:
  - placa;
  - marca;
  - modelo;
  - cor;
  - ano;
- campos ficam em modo somente leitura;
- mostrar estado visual `Veiculo selecionado`;
- oferecer acao para remover/trocar selecao.

Payload esperado nesta condicao:

```ts
{
  vehicleId: string;
}
```

Nao enviar `vehicle` quando `vehicleId` estiver definido.

### Cadastro rapido de veiculo

Quando nenhum veiculo estiver selecionado:

- placa opcional;
- marca opcional;
- modelo opcional;
- cor opcional;
- ano opcional, inteiro quando preenchido.

Payload esperado nesta condicao:

```ts
{
  vehicle?: {
    plate?: string | null;
    brand?: string | null;
    model?: string | null;
    color?: string | null;
    year?: number | null;
  } | null;
}
```

Se todos os campos de veiculo estiverem vazios, o payload deve omitir `vehicle`.

## Arquitetura proposta

Arquivos esperados para o recorte:

```txt
src/app/(private)/quotes/new/page.tsx
src/features/quotes/components/create/quote-create-wizard.tsx
src/features/quotes/components/create/quote-customer-vehicle-step.tsx
src/features/quotes/schemas/create-quote-schema.ts
src/features/quotes/types/create-quote.ts
```

Se a busca exigir API propria:

```txt
src/features/quotes/api/list-quote-customer-options.ts
src/features/quotes/api/list-quote-vehicle-options.ts
src/features/quotes/hooks/use-quote-customer-options.ts
src/features/quotes/hooks/use-quote-vehicle-options.ts
```

Reaproveitar padroes existentes antes de criar novos:

- `Combobox` usado nos formularios de agendamento/veiculo;
- `InputField` e `FormField`;
- `Button`;
- `Badge`;
- `Card` ou superficies simples com `border-border`;
- React Query com `QUERY_KEYS`.

## Dados e validacao

O formulario deve usar React Hook Form com Zod.

Regras do step 1:

- `customerId` e `customer.name` sao alternativas;
- se `customerId` existir, os campos manuais de cliente nao devem compor o payload;
- se `vehicleId` existir, os campos manuais de veiculo nao devem compor o payload;
- `vehicle` e opcional;
- `year` deve ser convertido para numero inteiro quando preenchido;
- strings vazias devem virar `null` ou ser omitidas conforme o builder final.

O frontend so valida o necessario para orientar a UX. Validacoes de dominio continuam no backend.

## Estados e acessibilidade

- Campos devem ter labels visiveis.
- Acoes icon-only precisam de `aria-label`.
- Botoes devem ter area clicavel confortavel no mobile.
- Erros aparecem proximos aos campos.
- Read-only deve ser distinguivel de disabled e manter contraste.
- O botao `Proximo` deve indicar loading/validacao quando necessario.
- O foco deve ir para o primeiro campo invalido ao tentar avancar.

## Testes

Testes sugeridos para este recorte:

- unit test para schema do step 1;
- unit test para builder de payload parcial:
  - selecionado envia `customerId`;
  - manual envia `customer`;
  - selecionado envia `vehicleId`;
  - veiculo vazio nao envia dados manuais indevidos.

Teste de componente fica opcional neste primeiro recorte, recomendado apenas se a logica de selecao/remocao ficar mais complexa que o previsto.

## Riscos e observacoes

- O schema informado nao inclui e-mail em `customer`, mas a UI solicitada inclui e-mail. A implementacao deve confirmar o contrato real antes de enviar esse campo.
- A disponibilidade dos endpoints de busca de cliente e veiculo pode alterar o primeiro recorte. Se nao houver endpoint pronto, o step pode nascer com UI/estado local e mocks internos removiveis.
- A decisao de veiculo depender ou nao de cliente selecionado deve seguir o endpoint existente para evitar comportamento falso no frontend.
