# Sistema Frontend — Fio & Luz

## 1. Introdução e Visão Geral

O frontend do **Fio & Luz** é o ponto de contato da usuária com o sistema de apoio ao bordado manual. Trata-se de uma aplicação web progressiva (PWA) construída com Next.js 16 (App Router), TypeScript estrito e Tailwind CSS v4, seguindo uma arquitetura inspirada em Clean Architecture com camadas bem definidas.

testeste
A aplicação permite que a bordadeira navegue por um catálogo de riscos (patterns), favorite seus designs preferidos no "Baú Pessoal" (limite de 100), calibre a tela do dispositivo para escala física real e utilize a "Mesa de Luz Digital" para transferir o desenho diretamente para o tecido com o auxílio de um simulador de bastidor, dicas curatoriais de fios e pontos, e modo tela cheia com wake lock.

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Propósito |
|---|---|---|
| Next.js | 16.2.3 | Framework React com App Router, Server Components, SSG |
| React | 19.2.4 | Biblioteca de interface |
| TypeScript | 5.x | Tipagem estrita em 100% dos arquivos |
| Tailwind CSS | 4.x | Estilização utilitária com PostCSS (`@tailwindcss/postcss`) |
| shadcn/ui | base-nova | Componentes de UI acessíveis (Button, Card, Input, Switch, Skeleton, Sonner) |
| @base-ui/react | 1.4.0 | Primitivas headless de UI (base do shadcn) |
| @tanstack/react-query | 5.100.10 | Gerenciamento de estado assíncrono (cache, mutações, invalidação) |
| axios | 1.16.1 | Cliente HTTP (preparado para API real) |
| lucide-react | 1.8.0 | Ícones |
| sonner | 2.0.7 | Notificações toast |
| clsx + tailwind-merge | — | Utilitário `cn()` para merge condicional de classes |
| class-variance-authority | 0.7.1 | Variantes de componentes (CVA) |
| react-hook-form + zod | 7.75.0 / 4.4.3 | Formulários e validação |
| next-themes | 0.4.6 | Suporte a temas (claro/escuro) |
| jwt-decode | 4.0.0 | Decodificação de JWT no cliente |
| Vitest | 4.1.6 | Testes unitários e de integração (jsdom) |
| Playwright | 1.60.0 | Testes e2e (chromium, firefox, webkit) |
| MSW | 2.14.6 | Mock de Service Worker para testes |
| Testing Library | — | Renderização e queries de componentes em testes |

---

## 3. Arquitetura em Camadas (Clean Architecture)

O frontend segue uma arquitetura hexagonal simplificada com 4 camadas, além das páginas e componentes:

```
app/ + components/    ← Camada de Apresentação (Next.js Pages & React Components)
    ↓
src/presentation/     ← Hooks React Query, Providers
    ↓
src/application/      ← Casos de Uso, AuthCubit (orquestração)
    ↓
src/domain/           ← Entidades, Value Objects, Interfaces de Repositório (0 dependências externas)
    ↑
src/infrastructure/   ← Repositórios Mock, Mappers, Axios Client
```

A regra de dependência é estrita: camadas externas conhecem as internas, mas **nunca o contrário**. A camada de domínio não importa nada de React, Next.js, axios ou qualquer framework.

### 3.1. Camada de Domínio (`src/domain/`)

Contém as definições de negócio mais puras:

**Entidades:**
- **`Pattern.ts`** — Interface com `id`, `title`, `imagePath`, `thumbnailPath`, `scaleCmReference`, `difficulty` (tipo `DifficultyLevel` = 1 | 2 | 3 | 4 | 5), `collectionId` opcional. Exporta a função `getDifficultyLabel()` que retorna os rótulos em português: Iniciante, Fácil, Médio, Avançado, Mestre.
- **`Collection.ts`** — Interface com `id`, `title`, `coverImagePath`.
- **`User.ts`** — Interface `User` (id, email, lastLoginAt) e `AuthSession` (user, token).

**Value Objects:**
- **`ScaleEngine.ts`** — Classe utilitária pura com métodos estáticos:
  - `calculateScaleFactor(cmReference, naturalPixelSize, deviceScale)`: Calcula o fator de escala CSS para renderização em tamanho real. Fórmula: `(cmReference * deviceScale.pixelsPerCm) / naturalPixelSize`. Retorna 1 se `naturalPixelSize === 0` (proteção contra divisão por zero).
  - `cmToPixels(cm, deviceScale)`: Converte centímetros para pixels: `cm * deviceScale.pixelsPerCm`. Essencial para a Mesa de Luz.
- **`DeviceScale.ts`** — Interface com `pixelsPerCm: number` e `lastCalibratedAt: Date`. Constante `DEFAULT_SCALE = 38` px/cm (aproximação para 96 DPI).

**Interfaces de Repositório ( contratos ):**
- `IPatternRepository` — Define: `listAll()`, `findById(id)`, `listCollections()`, `listByCollection(collectionId)`, `getFavorites()`, `toggleFavorite(patternId)`.
- `IAuthRepository` — Define: `requestMagicLink(email)`, `authenticate(token)`, `logout()`, `getCurrentSession()`.
- `ICuratorialSuggestionRepository` — Define `getSuggestions(patternId)` que retorna `{ threads: string[], stitches: string[] }`.

### 3.2. Camada de Aplicação (`src/application/`)

Contém os casos de uso e a máquina de estado de autenticação:

**Casos de Uso:**
- **`GetFavoritesUseCase.ts`** — Executa `repository.getFavorites()`. Sem validação adicional (puramente delegativo). Comentário interno sugere possível filtro futura para "top 10".
- **`ToggleFavoriteUseCase.ts`** — Regra de negócio: verifica se `patternId` não é vazio (lança erro caso seja). Obtém a lista atual de favoritos. Se o pattern **não** está favoritado e a lista já tem >= 100 itens, **lança exceção** `"Limite de 100 favoritos atingido no Baú Pessoal."`. Se já está favoritado, a remoção é permitida mesmo no limite.
- **`GetCuratorialSuggestionsUseCase.ts`** — Valida que `patternId` não é vazio (`"O ID do risco é obrigatório."`), então delega ao repositório.

**AuthCubit (`AuthCubit.ts`):**
- Gerenciador de estado de autenticação no padrão Cubit (pub/sub simples).
- Estados: `initial` → `loading` → `authenticated` | `unauthenticated` | `error`.
- Métodos: `loginMock(token)`, `requestMagicLink(email)`, `logout()`, `subscribe(listener)`, `getState()`.
- O singleton `authCubit` é instanciado com `MockAuthRepository`.
- Importa `jwtDecode` mas não o utiliza atualmente (claims são hardcoded como `{ role: "admin" }`).
- Padrão observer: `subscribe()` retorna função `unsubscribe`, usada em `useEffect` nos componentes.

### 3.3. Camada de Infraestrutura (`src/infrastructure/`)

**Repositórios Mock (funcionamento independente de backend real):**

- **`MockPatternRepository.ts`** — 5 patterns hardcoded em 3 coleções (Natureza, Animais, Abstrato). Favoritos persistidos em `localStorage` sob a chave `fioeluz_favorites` como array JSON de IDs. Implementa `IPatternRepository` por completo. Possui guard `typeof window === 'undefined'` para segurança SSR.
- **`MockAuthRepository.ts`** — Simula autenticação: `authenticate()` armazena token em `localStorage` e retorna sessão mock (`user@example.com`). `logout()` remove token. `getCurrentSession()` verifica existência do token.
- **`CuratorialSuggestionProvider.ts`** — Fetch HTTP para `/suggestions.json`, retorna sugestões por `patternId` ou `null` com degradação graciosa em caso de erro.

**Mappers:**
- **`PatternMapper.ts`** — Converte snake_case da API (`image_path`, `scale_cm_reference`, `difficulty_level`, `collection_id`) para camelCase do domínio. Métodos estáticos `toDomain()` e `toDomainList()`.
- **`CollectionMapper.ts`** — Mesmo padrão para coleções.

**HTTP Client:**
- **`axiosClient.ts`** — Instância axios pré-configurada com `baseURL` da env `NEXT_PUBLIC_API_URL` (fallback `http://localhost:3000/api`). Interceptor de request adiciona `Authorization: Bearer <token>` do `localStorage`. Interceptor de response loga warning em 401. **Atualmente não utilizado** (todo fluxo usa repositórios mock).

### 3.4. Camada de Apresentação (`src/presentation/`)

**Hooks React Query:**

- **`useFavorites.ts`** — `useQuery` com key `['favorites']`. Instancia `MockPatternRepository` + `GetFavoritesUseCase` a cada chamada.
- **`useToggleFavorite.ts`** — `useMutation`. On success: invalida `['favorites']` (refetch automático). On error: exibe toast com a mensagem de erro.
- **`useCuratorialSuggestions.ts`** — `useQuery` com key `['suggestions', patternId]`. Instancia `CuratorialSuggestionProvider` + `GetCuratorialSuggestionsUseCase`.
- **`useScaleCalibration.ts`** — Hook de estado local (não React Query). Gerencia calibração da tela em `localStorage` chave `fioeluz_device_scale`. Expõe `{ scale, saveCalibration, isLoaded, isCalibrated }`. `isCalibrated` verifica se `lastCalibratedAt > new Date(0)` (ou seja, se já foi calibrada ao menos uma vez).

**Provider:**
- **`QueryProvider.tsx`** — Wrapper `'use client'` que cria `QueryClient` com `staleTime: 60 * 1000` (1 minuto) e envolve children em `QueryClientProvider`.

---

## 4. Páginas e Componentes

### 4.1. Páginas (App Router)

**`/` (Home - `app/page.tsx` — RSC)**
- Server Component assíncrono que faz data fetching diretamente do `MockPatternRepository`.
- Carrega patterns e collections, passa como props para o `Catalog` (client component) via `Suspense` com fallback `CatalogSkeleton`.
- Renderiza `Header`, `HeroClient` (modal "Como Funciona?" com 3 passos), `Catalog`, `Footer`.

**`/login` (`app/login/page.tsx` — Client Component)**
- Formulário de magic link: campo de email + botão "Receber Link Mágico".
- Usa `authCubit.requestMagicLink(email)` diretamente (não via hook).
- Estados: loading ("Enviando..."), sucesso (toast), erro (toast).
- Não possui validação de formato de email no frontend.

**`/vault` (Baú Pessoal — `app/vault/page.tsx` RSC + `VaultClient.tsx` Client)**
- RSC carrega collections, passa para `VaultClient`.
- `VaultClient` exibe patterns favoritados com filtros: busca textual, coleção, dificuldade (1-5), loading skeleton, estado vazio com ícone `ArchiveX`.
- Cada card tem: thumbnail, badge de dificuldade, título, descrição com escala, botão coração (preenchido vermelho se favoritado), link "Abrir Mesa de Luz".

**`/light-table/[id]` (`app/light-table/[id]/page.tsx` — RSC)**
- RSC com `params: Promise<{ id: string }>` (convenção Next.js 16).
- Busca pattern por ID no `MockPatternRepository`. Se não encontrado, renderiza "Risco não encontrado" com link de volta.
- Renderiza `<LightTableEngine pattern={pattern} />`.

### 4.2. Componentes Compartilhados

**`Header` (`components/header.tsx`):**
- Sticky header com backdrop blur.
- Logotipo "Fio & Luz" com ícone de lâmpada.
- Navegação: "Catálogo" (link para `/#catalog-section`), "Meu Baú" (link para `/vault`).
- Destaque de link ativo via `usePathname()`.
- Estado de autenticação via `authCubit.subscribe()`: se autenticado → mostra email + "Sair"; senão → "Entrar (Mock)" que chama `authCubit.loginMock("mock-token")`.

**`Footer` (`components/footer.tsx`):**
- Simples, fundo escuro (`bg-charcoal`), copyright.

**`HeroClient` (`components/hero-client.tsx`):**
- Botões "Ver Catálogo Completo" (scroll suave para `#catalog-section`) e "Como Funciona?" (abre modal explicativo com 3 passos).
- Modal com steps numerados: (1) Navegue pelo catálogo, (2) Calibre com um cartão, (3) Transfira para o tecido.

**`Catalog` (`components/catalog.tsx`):**
- O componente central de descoberta. Props: `initialPatterns` (do server) e `collections`.
- **Barra de filtros:**
  - Botões de coleção (incluindo "Todos")
  - Filtro de dificuldade: botões circulares numerados 1-5 (toggle on/off, escala visual com `scale-110` no ativo)
  - Switch "Ocultar favoritados"
- **Campo de busca:** filtra por título (case-insensitive).
- **Grid de patterns:** Cards com thumbnail (efeito hover scale), botão coração (preenchido se favoritado), badge de dificuldade, título, descrição com escala, link "Usar Mesa de Luz".
- Toda filtragem é **client-side** (não há requisição ao servidor).

**`CalibrationOverlay` (`components/calibration-overlay.tsx`):**
- Modal de calibração: referência de cartão magnético (8.56cm largura padrão).
- Botões +/- ajustam `pixelsPerCm` dinamicamente com visual do cartão redimensionando em tempo real.
- `currentCardWidthPx = creditCardWidthCm * pixelsPerCm` (8.56 * pixelsPerCm).
- Ao salvar, chama `onSave(pixelsPerCm)`.

**`LightTableEngine` (`components/light-table/engine.tsx`):**
- O componente mais complexo do sistema (~328 linhas).
- **Modo normal:** duas colunas — imagem do pattern com simulador de bastidor (tamanhos: 10, 14, 18, 22cm) + controles (calibração, botão "Ativar Mesa de Luz", instruções de uso, dicas curatoriais).
- **Simulador de Bastidor:** overlay circular semi-transparente sobre a imagem, dimensionado proporcionalmente ao `scaleCmReference` do pattern e ao tamanho selecionado. Usa `shadow-[0_0_0_9999px_rgba(255,255,255,0.6)]` para escurecer área externa ao bastidor.
- **Modo tela cheia (Mesa de Luz):**
  1. Ativa `requestFullscreen()`
  2. Solicita **Wake Lock** (`navigator.wakeLock.request('screen')`) — mantém tela acesa
  3. Renderiza pattern em **tamanho físico real** via `ScaleEngine.cmToPixels()`
  4. Controle flutuante de opacidade (range 0.1 - 1.0)
  5. Prevenção de gestos touch (para não deslocar o tecido)
  6. **Saída:** toque longo de 1.5s (mobile) ou tecla ESC/clique (desktop)
  7. **Aviso térmico:** toast após 5 minutos de tela cheia
  8. **iOS fallback:** elemento `<video>` oculto para wake lock (loop de vídeo base64 silencioso)
  9. Imagem em fullscreen com `invert-0 contrast-125 brightness-110` para máxima visibilidade
- **Dicas Curatoriais:** cards com sugestões de fios DMC e pontos para cada pattern, vindos de `/suggestions.json`.

### 4.3. Componentes UI (shadcn/ui)

Todos seguem o estilo `base-nova` do shadcn/ui:

- **Button**: 6 variantes (default, outline, secondary, ghost, destructive, link), 8 tamanhos (default até icon-lg). Usa `@base-ui/react/button` como primitiva.
- **Card**: Composed de Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter. Suporta `data-size` (`default` | `sm`), `@container` queries para responsividade.
- **Input**: Base UI Input primitiva, focus-visible ring, suporte a `aria-invalid`.
- **Label**: Label com peer/group disabled states.
- **Skeleton**: `animate-pulse rounded-md bg-muted`.
- **Switch**: Base UI Switch primitiva, suporte a `size` (`sm` | `default`), `data-checked`/`data-unchecked`.
- **Sonner**: Toaster com `next-themes`, ícones customizados por tipo (success/info/warning/error/loading), CSS variables com tokens shadcn.

---

## 5. Fluxos de Dados

### 5.1. Data Fetching em Server Components
```
app/page.tsx (RSC)
  → new MockPatternRepository()
  → repo.listAll() → Pattern[]
  → repo.listCollections() → Collection[]
  → <Catalog initialPatterns={patterns} collections={collections} />
```

### 5.2. Favoritar Pattern
```
<Heart onClick>
  → useToggleFavorite.mutate(patternId)
    → new MockPatternRepository()
    → new ToggleFavoriteUseCase(repo)
    → useCase.execute(patternId)
      → valida patternId não vazio
      → repo.getFavorites()  ← verifica se já é favorito
      → if (não favoritado && lista >= 100) → THROW "Limite..."
      → repo.toggleFavorite(patternId) ← adiciona/remove em localStorage
  → onSuccess: queryClient.invalidateQueries(['favorites'])
  → onError: toast.error(mensagem)
```

### 5.3. Ativação da Mesa de Luz
```
<Button "Ativar Mesa de Luz">
  → toggleFullscreen()
  → document.documentElement.requestFullscreen()
  → navigator.wakeLock.request('screen')    ← Wake Lock
  → setIsFullscreen(true)
  → toast.success("Mesa de Luz Ativada")
  → setTimeout(5min): toast.warning("Aviso Térmico")
  → Render: Image em ScaleEngine.cmToPixels(scaleCmReference, deviceScale)
```

### 5.4. Fluxo de Autenticação (Simulado)
```
<Login page>
  → authCubit.requestMagicLink(email)
    → MockAuthRepository.requestMagicLink(email)   ← console.log apenas
    → estado: unauthenticated (toast de sucesso)

<Header "Entrar (Mock)">
  → authCubit.loginMock("mock-token")
    → MockAuthRepository.authenticate("mock-token")
      → armazena token em localStorage
      → retorna { user: { id: "u1", email: "user@example.com" }, token: "mock-token" }
    → estado: authenticated, claims: { role: "admin" }
```

---

## 6. Regras de Negócio Implementadas no Frontend

| Regra | Local | Tipo |
|---|---|---|
| Dificuldade deve ser 1-5 | `Pattern.ts` (tipo `DifficultyLevel`) | Type-level (compilação) |
| Limite de 100 favoritos | `ToggleFavoriteUseCase.ts:14-17` | Runtime (lança exceção) |
| Remoção permitida mesmo no limite | `ToggleFavoriteUseCase.ts` | Runtime (permitido sempre) |
| Tamanho físico real via calibração | `ScaleEngine.ts` + `useScaleCalibration.ts` | Runtime (renderização) |
| Aviso térmico após 5 min fullscreen | `LightTableEngine.tsx:92-97` | Runtime (toast warning) |
| Wake Lock para manter tela acesa | `LightTableEngine.tsx:42-51` | Runtime (navegador) |
| Magic links (sem senhas) | `AuthCubit.ts` (contrato de autenticação) | Design/arquitetura |
| Calibração: cartão = 8.56cm de referência | `CalibrationOverlay.tsx` | Constante física |
| Simulador de bastidor proporcional | `LightTableEngine.tsx:147-155` | Renderização proporcional |

---

## 7. Testes

### 7.1. Configuração

- **Framework:** Vitest 4.1.6 com `jsdom`, globals habilitadas.
- **Setup:** `vitest.setup.ts` mocka `matchMedia` e `ResizeObserver` (necessários para shadcn/ui).
- **Alias:** `@` mapeado para raiz do projeto (equivalente ao `tsconfig.json`).
- **Coverage:** v8 provider, threshold de 70% (lines, functions, branches, statements).
- **Exclusões:** node_modules, .next, config files, `.d.ts`.

### 7.2. Testes Existentes (10 arquivos)

| Arquivo | O que testa |
|---|---|
| `src/domain/entities/Pattern.spec.ts` | `getDifficultyLabel()` — todos os 5 níveis, valor inválido |
| `src/domain/value_objects/ScaleEngine.spec.ts` | `calculateScaleFactor` (caso normal e divisão por zero), `cmToPixels` |
| `src/application/useCases/GetFavoritesUseCase.spec.ts` | Execução e retorno |
| `src/application/useCases/ToggleFavoriteUseCase.spec.ts` | Adição, remoção, limite 100, patternId vazio |
| `src/application/useCases/GetCuratorialSuggestionsUseCase.spec.ts` | Execução e patternId vazio |
| `src/application/auth/AuthCubit.spec.ts` | Estados (initial, loading, authenticated, unauthenticated, error), login, logout, magic link |
| `src/infrastructure/repositories/MockPatternRepository.spec.ts` | CRUD: listAll, findById, listCollections, toggleFavorite round-trip |
| `src/infrastructure/repositories/MockAuthRepository.spec.ts` | authenticate, logout, getCurrentSession, requestMagicLink |
| `components/catalog.spec.tsx` | Renderização, filtro por busca, limpar busca (wrapped em QueryProvider) |
| `components/ExampleComponent.spec.tsx` | Teste de configuração (setup verification) |

### 7.3. Padrão de Teste para Componentes

Componentes que usam hooks React Query (`useFavorites`, `useToggleFavorite`) devem ser envolvidos em `<QueryProvider>` no teste:

```tsx
render(
  <QueryProvider>
    <Catalog initialPatterns={mockPatterns} />
  </QueryProvider>
);
```

---

## 8. Configuração e DevOps

### 8.1. Docker

O frontend possui `Dockerfile` multi-estágio (deps → builder → runner) com `output: standalone`. A imagem final é mínima, roda com usuário `nextjs` não-root, expõe porta 3000.

No `docker-compose.yml`, o serviço `web`:
- Não monta volume para desenvolvimento (build estático)
- Recebe `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Depende do serviço `api` (que por sua vez depende de `db` com healthcheck)

### 8.2. Variáveis de Ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | Base URL do axiosClient |
| `PORT` | 3000 | Porta do servidor |

### 8.3. Lint e Formatação

ESLint v9 (flat config) com `eslint-config-next/core-web-vitals` e `eslint-config-next/typescript`. Ignora `.next`, `out`, `build`, `next-env.d.ts`.

### 8.4. Testes E2E (Playwright)

Configurado com 3 projetos (chromium, firefox, webkit), 30s timeout, `npm run dev` como web server. Diretório `./e2e` — **nenhum teste e2e foi escrito ainda.**

---

## 9. Incompletude do Frontend

Apesar de funcional e bem estruturado, o frontend apresenta diversas lacunas que precisam ser endereçadas:

### 9.1. Ausência de Conexão com o Backend Real

- Todos os dados são mockados (`MockPatternRepository`, `MockAuthRepository`). O `axiosClient.ts` está configurado mas **não é utilizado por nenhum componente ou hook**.
- Não existe um `HttpPatternRepository` ou `HttpAuthRepository` que implemente as interfaces de domínio chamando a API real.
- Os mappers (`PatternMapper`, `CollectionMapper`) estão prontos mas sem uso ativo.

### 9.2. Falta de Service Worker / PWA

- A especificação (`openspec/config.yaml`) exige: Service Worker, suporte offline, cache de favoritos local, estratégia stale-while-revalidate.
- Nada disso foi implementado. Não há arquivo `sw.js`, `manifest.json`, ou registro de service worker.

### 9.3. Autenticação Não Funcional

- `proxy.ts` é um esqueleto de middleware que redirecionaria para `/login` se não houver token, mas o redirect está **comentado** — o acesso não é efetivamente bloqueado.
- O arquivo `proxy.ts` não está registrado como middleware do Next.js (não há `middleware.ts` na raiz). O nome do arquivo não segue a convenção do Next.js, sendo apenas um arquivo solto não importado por ninguém.
- `AuthCubit` importa `jwtDecode` mas nunca o utiliza (claims são `{ role: "admin" }` hardcoded).
- Não há proteção real de rotas: qualquer usuário pode acessar `/vault` sem autenticação.

### 9.4. Páginas e Fluxos Incompletos

- **Página de login funcional** mas sem validação de formato de email no frontend (apenas backend-side).
- **Página de signup** (`/signup`) mencionada em `proxy.ts` como rota pública, mas **não existe** no App Router.
- **Página de verify token** (`/verify?token=...`) não existe — o fluxo de magic link é interrompido após o envio do email.
- **Página de perfil / configurações** inexistente.
- **Estados de loading e erro** não são tratados em todas as páginas (ex: `/light-table/[id]` não tem tratamento de loading state).

### 9.5. Dados de Sugestões Limitados

- `suggestions.json` só tem dados para 3 dos 5 patterns mockados (IDs 1, 2, 3). Patterns 4 e 5 não têm sugestões curatoriais.

### 9.6. Falta de Testes

- **Nenhum teste e2e** foi escrito (Playwright configurado, diretório `e2e/` vazio).
- **Componentes sem teste:** `VaultClient`, `LightTableEngine`, `CalibrationOverlay`, `HeroClient`, `Header`, `Footer`, e todos os componentes UI.
- **Hooks sem teste:** `useScaleCalibration`, `useCuratorialSuggestions`, `useFavorites`, `useToggleFavorite`.
- **Coverage threshold de 70%** provavelmente não é atingido (não há execução recente para confirmar).

### 9.7. Outras Lacunas

- **Internacionalização:** Todo o texto está em português hardcoded, sem estrutura i18n.
- **Acessibilidade:** Embora o shadcn/ui forneça componentes acessíveis, não há verificação explícita de WCAG.
- **Tema escuro:** Configurado no `globals.css` (classe `.dark`) e no `Sonner` via `next-themes`, mas não há toggle de tema na interface.
- **Responsividade:** A aplicação funciona, mas não foi testada em diversos tamanhos de tela de forma sistemática.
- **Imagens mockadas:** As imagens em `/public/` (pattern-floral.png, pattern-animal.png, pattern-geometric.png) são placeholders genéricos.

---

## 10. Próximos Passos para Finalização

### 10.1. Integração com Backend Real (Prioridade Máxima)

1. Criar `HttpPatternRepository` implementando `IPatternRepository` usando `axiosClient` e `PatternMapper`.
2. Criar `HttpAuthRepository` implementando `IAuthRepository`.
3. Criar `HttpCuratorialSuggestionRepository` substituindo o fetch direto para `/suggestions.json`.
4. Substituir instâncias de `MockPatternRepository` nos hooks e server components por instâncias condicionais (mock em dev, http em prod) ou via injeção de dependência.
5. Implementar tratamento de erros de rede com retry e feedback visual.

### 10.2. Finalizar Autenticação

1. Criar `middleware.ts` funcional na raiz do frontend (usando o código de `proxy.ts` como base) que:
   - Redirecione para `/login` com `callbackUrl` se não autenticado
   - Permita rotas públicas (/, /login, /signup, /verify, /light-table, /_next, /favicon.ico)
2. Criar página `/verify?token=<uuid>` que chama o backend para validar o magic link e redireciona para o callbackUrl.
3. Criar página `/signup` (ou integrar na página de login já que o backend faz just-in-time provisioning).
4. Fazer `AuthCubit` usar `jwtDecode` para extrair claims reais do JWT.

### 10.3. Implementar PWA e Service Worker

1. Criar `public/sw.js` com estratégia stale-while-revalidate para assets estáticos e de catálogo.
2. Criar `public/manifest.json` com ícones, nome, tema.
3. Registrar service worker no layout ou em script separado.
4. Implementar cache de favoritos offline.
5. Testar funcionamento offline completo.

### 10.4. Completar Testes

1. **Testes de componentes:** `VaultClient`, `LightTableEngine`, `CalibrationOverlay`, `Header`, `Footer`, `HeroClient`.
2. **Testes de hooks:** `useScaleCalibration` (localStorage mock), `useFavorites`, `useToggleFavorite` (React Query mock).
3. **Testes e2e (Playwright):**
   - Fluxo completo: Home → Catálogo → Buscar → Filtrar → Favoritar → Baú Pessoal
   - Mesa de Luz: Navegação, calibração, fullscreen, opacidade, simulador de bastidor
   - Login: Magic link, autenticação mock
   - Erro 404 e error boundary
4. Verificar cobertura de 70% (executar `npm run test:coverage` e ajustar conforme necessário).

### 10.5. Melhorias de UX

1. Adicionar validação de email no formulário de login (regex simples).
2. Adicionar loading states no LightTableEngine (enquanto carrega sugestões e imagem).
3. Tratar estados de erro na página `/light-table/[id]` (pattern não encontrado já tem, mas erros de rede não).
4. Adicionar toggle de tema claro/escuro no Header.
5. Expandir `suggestions.json` para todos os patterns.

### 10.6. Refatorações Pontuais

1. Centralizar instanciação de repositórios em um ponto único (fábrica ou contexto) em vez de instanciar `new MockPatternRepository()` em cada hook/server component.
2. Remover importação não utilizada de `jwtDecode` no `AuthCubit` ou implementar seu uso real.
3. Adicionar validação de schema com Zod nos formulários (react-hook-form + zod já estão nas dependências).
4. Criar hook `useAuth` que encapsule `authCubit.subscribe()` com `useSyncExternalStore` para evitar boilerplate nos componentes.

---

## 11. Resumo da Arquitetura para Tomada de Decisão

```
                           ┌─────────────────────────┐
                           │   Next.js App Router     │
                           │  (app/page.tsx + layout) │
                           └──────────┬──────────────┘
                                      │ Server Components
                                      ▼
                    ┌─────────────────────────────────┐
                    │     Componentes React            │
                    │  (components/ + components/ui/)  │
                    └──────────┬──────────────────────┘
                               │ Props + Hooks
                               ▼
                    ┌─────────────────────────────────┐
                    │    Hooks de Apresentação         │
                    │  (React Query + localStorage)    │
                    └──────────┬──────────────────────┘
                               │ Use Cases
                               ▼
                    ┌─────────────────────────────────┐
                    │      Casos de Uso                │
                    │  (regras de negócio finas)        │
                    └──────────┬──────────────────────┘
                               │ Repository Interfaces
                               ▼
                    ┌─────────────────────────────────┐
                    │   Repositórios (Mock/HTTP)       │
                    │   + Mappers + Axios Client       │
                    └──────────┬──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Backend (opcional via mock) │
                    │   + localStorage (favoritos,      │
                    │     calibração, auth)             │
                    └─────────────────────────────────┘
```

---

*Documento gerado em maio de 2026. Reflete o estado atual do frontend e serve como guia para implementação das próximas etapas.*
