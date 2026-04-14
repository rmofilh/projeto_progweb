# Documentação: Inicialização do Frontend e Dockerização (Fio & Luz)

## 1. Visão Geral
Esta etapa do projeto consistiu na criação do "PWA Shell" e na integração completa do frontend ao ecossistema Docker do projeto **Fio & Luz**. O objetivo foi estabelecer uma fundação sólida e resiliente, seguindo as especificações de design e infraestrutura.

## 2. Tecnologias Utilizadas
- **Framework:** Next.js 15+ (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** TailwindCSS v4
- **Componentes:** Shadcn/UI (Radix UI)
- **Containerização:** Docker (Multi-stage builds)

## 3. Implementação Técnica

### 3.1 Inicialização e Estrutura
O projeto foi inicializado no diretório `/frontend` com suporte nativo a TypeScript e TailwindCSS. A estrutura utiliza o **App Router**, permitindo o uso de *Server Components* por padrão para performance e SEO.

### 3.2 Design System e Identidade Visual
Seguindo o `design.md`, foram configurados os seguintes elementos no Tailwind:
- **Cores:**
  - `Alabaster` (#F2F2F2): Cor de fundo principal.
  - `Charcoal` (#333333): Cor de texto e elementos de alto contraste.
- **Tipografia:**
  - `Lora`: Fonte Serif para títulos e elementos de destaque.
  - `Outfit`: Fonte Sans-serif para corpo de texto e legibilidade.

### 3.3 Componentes Base (Shadcn/UI)
Foram instalados os componentes fundamentais para a interface inicial:
- `Button`: Ações e CTAs.
- `Card`: Coleções e itens do baú pessoal.
- `Input`: Campos de busca e formulários.
- `Skeleton`: Estados de carregamento.
- `Sonner`: Sistema de notificações (substituindo o Toast legado).

## 4. Docker e Orquestração

### 4.1 Dockerfile (Multi-stage)
O `Dockerfile` do frontend foi projetado para ser eficiente e seguro:
1. **Deps:** Instalação de dependências via `npm ci` em ambiente Alpine.
2. **Builder:** Compilação do projeto com `output: standalone`.
3. **Runner:** Imagem final mínima contendo apenas os artefatos necessários (`server.js`, `.next/static`, `public`), rodando com usuário não-root (nextjs).

### 4.2 Docker Compose
O serviço `web` foi integrado ao `docker-compose.yml`:
- **Porta:** 3000
- **Rede:** `app-network` (isolamento interno)
- **Variáveis de Ambiente:** `NEXT_PUBLIC_API_URL` configurada para comunicação com o backend.
- **Volumes:** Configurados para permitir desenvolvimento local com hot reloading.

## 5. Verificação Operacional
O sistema foi testado e validado:
- Build bem-sucedido com `docker compose build`.
- Orquestração completa com `docker compose up -d`.
- Verificação de logs confirmando o startup do servidor Next.js em modo standalone.

## 6. Próximos Passos
- Implementação das rotas de catálogo (Fase 4).
- Integração de dados reais via Server Components.
- Implementação da Engine de Mesa de Luz (Client Components).
