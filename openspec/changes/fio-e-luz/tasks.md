# Tarefas de Implementação: Fio & Luz (Anti-Hallucination Aligned)

## Fase 1: Infraestrutura Estrita (Docker & Banco de Dados)
- [x] 1.1 Criar a topologia `docker-compose.yml` definindo os serviços `db` (postgres:15), `api` e `web` acoplados em uma rede interna.
- [x] 1.2 Configurar as variáveis de ambiente base (ex: `DATABASE_URL`) nos módulos para que a injeção funcione de cara.
- [x] 1.3 Subir o serviço do banco (`docker compose up db -d`) e validar se a porta 5432 está operacional e aceitando conexões.

## Fase 2: Backend Base (Fundação Concluída)
- [x] 2.1 Configurar o projeto Python (Dockerfile com `python:3.10`, FastAPI e uvicorn) focado no serviço `api`.
- [x] 2.2 Criar a Entidade base do banco (usando SQLModel) garantindo que reflete as tabelas propostas no design.
- [x] 2.3 Criar os contratos Pydantic v2 rigorosos (e.g. `PatternCreate`, `PatternResponse`) com as anotações exatas de tipo exigidas.
- [x] 2.4 Criar a rota GET raiz `/` no FastAPI mapeando o SwaggerUI e retornando 200 OK.
- [x] 2.5 Levantar o container da API (`docker compose up api`) e validar via Curl se a rota raiz e os Schemas de erro padrão (422) funcionam e o banco se conectou no startup. 

## Fase 2.5: Refatoração Arquitetural e Escalabilidade do Backend (EDA Clássico)
- [x] 2.5.1 **Passo 1: Desacoplamento e Camadas (MVC/Domain)**. Isolar lógicas em pastas. O `Service` deve ser o guardião estrito e **único** da regra de negócio (garantindo centralização - Correção 5). A API (Controller) não os acessa diretamente, repassando para o Service lidar com Repositories e Schemas.
- [x] 2.5.2 **Passo 2: Mensageria, Outbox Reverso e Padrões (Broker/Tracing)**. O Service, antes de emitir um evento, deve gravar um registro inicial (`status=PROCESSING`) no banco mantendo a rastreabilidade (Correção 1). Ao emitir de fato ao Message Broker, deve usar um Envelope JSON padronizado com um `correlation_id` obrigatório para logs estruturados (Correção 6). A rota retorna `HTTP 202` com *endpoints* ou sinalização de polling para status do frontend (Correção 7).
- [x] 2.5.3 **Passo 3: Workers Assíncronos (Idempotência e DLQ)**. Criar Workers separados que consumam o Broker. O processo deve verificar o banco antes da execução garantindo **Idempotência** plena contra reprocessamento e duplicidade (Correção 4). Limites de *retry* que falharem devem direcionar para uma **Dead Letter Queue (DLQ)** para intervenção manual segura, nunca perdendo o payload (Correção 3).
- [x] 2.5.4 **Passo 4: Refinamento de Banco (Otimização I/O)**. Mover de driver síncrono para `asyncpg` e `AsyncSession` no SQLModel. Tratar isso expressamente como uma *otimização de performance local*, não como a fundação arquitetural que o EDA já forneceu (Correção 2).

## Fase 3: Frontend Base (Next.js App Router & Shadcn)
- [ ] 3.1 Inicializar o "PWA Shell" via Next.js com App Router configurando estritamente TypeScript em todos os arquivos.
- [ ] 3.2 Configurar o TailwindCSS implementando no `theme.extend` o design system (Cores Alabaster/Charcoal, Fontes Lora/Outfit).
- [ ] 3.3 Inicializar e instalar os 5 componentes chave restritos do Shadcn/UI: Button, Card, Input, Skeleton e Toast. Proibido forjar componentes complexos na mão.
- [ ] 3.4 Validar o frontend injetando temporariamente um `[ ] Button` do Shadcn na página raiz para checar a renderização (RSC vs Client limits).

## Fase 4: Implementação do Domínio Restrito & UI
- [ ] 4.1 Implementar a página de Catálogo (Discovery) exigindo que seja um *Server Component* para injetar os dados vindo da API.
- [ ] 4.2 Inserir na rota referida o tratamento exato de Skeleton fallback via Shadcn caso o fetch demore ou dê erro (Testes Manuais de Offline).
- [ ] 4.3 Implementar o Módulo "Engine de Mesa de Luz" separando numa sub-pasta estrita utilizando o pragma `'use client'` ativando a Wake Lock API.
- [ ] 4.4 Configurar cenários de Crash/Error Toast (500 do DB down e 422 param fail) acionando notificações Shadcn Toast no PWA Shell.

## Fase 5: Persistência Resiliente e PWA
- [ ] 5.1 Implementar sistema IndexedDB local para refletir favoritos.
- [ ] 5.2 Amarrar sistema de Background Sync (Service Worker) para interceptar os POST favorites que ocorrerem off-grid.
