Você é um agente de desenvolvimento frontend sênior especialista em Next.js, React, TypeScript, Tailwind CSS, Shadcn UI, Design Systems e UI/UX para SaaS.

Preciso que você implemente o frontend da área interna da plataforma usando como fonte de verdade o `design.json` fornecido e este site.

A landing page oficial já existe: https://asset-manager--fehpereira237.replit.app/ e o sistema interno precisa parecer parte do mesmo produto. Portanto, a identidade visual deve seguir fielmente os tokens do `design.json`: verde profundo, off-white/ivory, tons neutros quentes, dourado/champagne sutil, bordas suaves, cards premium, sombras discretas, tipografia moderna e aparência minimalista sofisticada.

## Objetivo

Criar um plano de implementação e começar a estruturar as telas internas necessárias para a plataforma de gestão estéticas automotivas.

A aplicação deve transmitir:

- sofisticação;
- confiança;
- organização;
- clareza operacional;
- tecnologia;
- aparência SaaS premium;
- continuidade visual com a landing page oficial.

Não use uma estética genérica de lava-rápido. Evite azul saturado, excesso de ícones de carro, gradientes exagerados, visual muito colorido ou interface poluída.

## Documentos de referência

Use obrigatoriamente:

1. `design.json` — fonte de verdade para identidade visual, tokens, cores, typography, spacing, radius, shadows, componentes e temas.
2. Documentação de UI/UX e Frontend anexada — fonte de verdade para módulos, telas, fluxos, componentes necessários e prioridades de implementação.

## Antes de implementar

Analise o estado atual do projeto:

- stack utilizada;
- estrutura de pastas;
- configuração do Tailwind;
- uso de Shadcn UI;
- estilos globais;
- layouts existentes;
- componentes reaproveitáveis;
- rotas existentes;
- padrões atuais de formulários, tabelas e chamadas de API.

Não altere backend e não mude regras de negócio.

## Etapa 1 — Design System técnico

Implemente os tokens do `design.json` como camada real de design system.

Priorize:

- CSS variables em `globals.css`;
- suporte a light theme;
- suporte a dark theme;
- extensão do `tailwind.config`;
- tokens semânticos;
- radius;
- shadows;
- typography;
- spacing;
- status colors;
- focus ring;
- motion tokens.

Crie tokens como:

- `background`;
- `foreground`;
- `card`;
- `card-foreground`;
- `primary`;
- `primary-foreground`;
- `secondary`;
- `muted`;
- `muted-foreground`;
- `border`;
- `input`;
- `ring`;
- `sidebar-background`;
- `sidebar-foreground`;
- `sidebar-active`;
- `success`;
- `warning`;
- `danger`;
- `info`.

Evite cores hardcoded espalhadas.

## Etapa 2 — Componentes base

Se necessário use: `npx shadcn@latest add (component-name)`. Evite criar componentes que o shadcn já fornece, prefira instala-los
Crie ou atualize os componentes reutilizáveis:

- AppLayout;
- Sidebar;
- Header;
- PageHeader;
- Button;
- Input;
- Textarea;
- Select;
- Checkbox;
- Switch;
- Tabs;
- Card;
- DataTable;
- FilterBar;
- StatusBadge;
- EmptyState;
- ConfirmDialog;
- LoadingSkeleton;
- FormSection;
- MoneyInput;
- DatePicker;
- CustomerSelect;
- VehicleSelect;
- ServiceSelect;
- Modal/Dialog;
- Drawer/Sheet;
- Toast;
- Dropdown;
- KPI Card;
- Calendar components.

Todos os componentes devem usar os tokens do `design.json`.

Para cada componente, garanta estados:

- default;
- hover;
- active;
- focus;
- disabled;
- loading, quando aplicável.

## Etapa 3 — Layout autenticado

Implemente o layout principal da aplicação interna com:

- sidebar lateral escura em verde profundo;
- navegação agrupada;
- item ativo destacado;
- header/topbar limpo;
- área de conteúdo com fundo ivory/off-white;
- cards brancos ou levemente quentes;
- espaçamento generoso;
- responsividade;
- sidebar como drawer no mobile.

Menu principal:

- Dashboard;
- Agenda;
- Clientes;
- Veículos;
- Serviços;
- Orçamentos;
- PDV / Caixa;
- Relatórios;
- Configurações.

## Etapa 4 — Telas da Fase 1

Implemente a base operacional:

### Login

- tela limpa e coerente com a landing;
- formulário centralizado;
- opção de login com Google;
- feedback de erro;
- loading state.

### Cadastro de estabelecimento

- formulário dividido em seções;
- dados principais do estabelecimento;
- layout premium e claro.

### Dashboard

Criar cards para:

- agendamentos de hoje;
- orçamentos pendentes;
- receita do dia;
- ticket médio;
- serviços concluídos;
- cancelamentos.

Criar também:

- agenda resumida do dia;
- últimos orçamentos;
- movimentações recentes do PDV.

### Clientes

Criar:

- listagem com tabela;
- busca por nome;
- busca por telefone;
- filtro por CPF/CNPJ;
- filtro por data de cadastro;
- ações rápidas: novo cliente, editar, visualizar, criar agendamento, criar orçamento;
- tela de detalhes com dados gerais, veículos, histórico de agendamentos e histórico de orçamentos.

### Veículos

Criar:

- listagem;
- cadastro;
- edição;
- vínculo com cliente;
- ações para criar orçamento ou agendamento.

### Serviços

Criar:

- listagem de serviços;
- cadastro e edição;
- filtros por nome, categoria, status e faixa de preço;
- status ativo/inativo;
- layout de tabela limpo e profissional.

### Agenda / Agendamentos

Criar:

- visão diária;
- visão semanal;
- lista de agendamentos;
- calendário;
- criação de agendamento;
- detalhes do agendamento;
- status: agendado, em andamento, concluído, cancelado.

## Etapa 5 — Telas da Fase 2: Orçamentos

Implementar:

- listagem de orçamentos;
- criação de orçamento por seções;
- detalhes do orçamento;
- preview visual em formato de documento;
- alteração de status;
- exportação PDF;
- exportação CSV;
- duplicar orçamento;
- cancelar orçamento;
- converter orçamento em agendamento.

A criação de orçamento deve conter:

1. dados do cliente;
2. dados do veículo;
3. serviços do orçamento;
4. valores, subtotal, desconto e total;
5. formas de pagamento;
6. termos e condições.

O total deve ser calculado automaticamente e o desconto não pode gerar valor negativo.

Status:

- rascunho;
- enviado;
- aprovado;
- recusado;
- expirado;
- convertido em agendamento;
- cancelado.

## Etapa 6 — Telas da Fase 3: PDV / Caixa

Implementar:

- tela principal do caixa;
- cards de saldo do dia, entradas, saídas, quantidade de movimentações e último fechamento;
- registro de entrada;
- registro de saída;
- listagem de movimentações;
- filtros por período, tipo, categoria, forma de pagamento, valor e responsável;
- resumo financeiro;
- previsão visual para fechamento de caixa.

O PDV será manual, sem integração com gateway de pagamento nesta fase.

## Etapa 7 — Fase 4: Relatórios e Configurações

Criar base visual para:

### Relatórios

- agendamentos por período;
- serviços mais realizados;
- receita por período;
- orçamentos por status;
- taxa de conversão de orçamento em agendamento;
- entradas e saídas do PDV;
- clientes mais recorrentes.

### Configurações

- dados do estabelecimento;
- CNPJ;
- telefone;
- endereço;
- logo;
- horário de funcionamento;
- termos padrão para orçamento;
- formas de pagamento aceitas;
- categorias de serviços;
- categorias do PDV.

## Rotas esperadas

Use ou adapte a seguinte estrutura:

```txt
/login
/register

/app/dashboard
/app/agenda
/app/appointments
/app/appointments/new
/app/appointments/:id

/app/customers
/app/customers/new
/app/customers/:id
/app/customers/:id/edit

/app/vehicles
/app/services

/app/budgets
/app/budgets/new
/app/budgets/:id
/app/budgets/:id/edit

/app/pos
/app/pos/movements
/app/pos/closing

/app/reports
/app/settings