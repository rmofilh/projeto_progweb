# 🧵 Brainstorming: Fio & Luz — Exploração Máxima de Possibilidades

> **Skill ativa:** brainstorming · Modo: Facilitador de Design  
> **Fonte:** [proposal.md](file:///home/alunos/Desktop/www/projeto_progweb/openspec/changes/fio-e-luz/proposal.md)  
> **Data:** 2026-03-10

---

## 1. Contexto Atual — O Que Já Existe

```
projeto_progweb/
├── openspec/changes/fio-e-luz/
│   └── proposal.md   ← documento-fonte da análise
└── .agent/skills/    ← skills de suporte ao desenvolvimento
```

**Estágio:** Proposta técnica aprovada, sem implementação iniciada. A proposta sanciona avanço para prototipação OpenAPI (`design.md`).

---

## 2. Entendimento do Sistema

### O que é
Uma **PWA full-stack** para praticantes de bordado manual, com dois problemas centrais resolvidos:
1. **Catálogo de Riscos (Moldes)** — descoberta rápida, curada, sem ruído de redes sociais
2. **Mesa de Luz Móvel** — converte tablet/smartphone em mesa de luz usando APIs nativas do browser

### Para quem
- **Usuária primária:** Mulheres 50+, letramento digital básico-moderado, praticam bordado por hobby ou voluntariado
- **Usuária indireta:** Organizações voluntárias que distribuem moldes padronizados

### Stack confirmada
| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.10+ + FastAPI + PostgreSQL |
| Frontend | Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui |
| Infra | Docker · GitHub Actions · Vercel (front) |
| Padrões | DDD + Clean Architecture + Pydantic end-to-end |

---

## 3. Núcleo de Domínio (DDD) — O que Está Definido

| Entidade | Papel |
|----------|-------|
| `Risco (Pattern)` | Ativo digital principal: imagem/SVG vetorial + metadados de proporção |
| `Coleção Temática` | Agregador curado pela plataforma (Natal, Iniciantes…) |
| `Mesa de Luz (Light Table Session)` | Estado eólico que gerencia o ciclo de transferência de molde |

---

## 4. 🚀 Exploração Máxima de Possibilidades

> *Esta seção mapeia todas as oportunidades identificáveis dentro dos limites do escopo proposto. São possibilidades, não compromissos de implementação.*

---

### 4.1 Possibilidades de UX / Produto

#### 🔍 A. Modo "Descoberta Guiada"
A entrada na plataforma poderia ser um **onboarding conversacional mínimo** com 2–3 perguntas visuais:
- "Qual é o seu nível?" → Iniciante / Intermediário / Avançado
- "Para qual bastidor você busca?" → 10cm / 15cm / 20cm+
- "Qual tema hoje?" → [grid de ícones temáticos]

**Por quê faz sentido:** Reduz paralisia decisória — a principal dor da usuária 50+ diante de catálogos extensos.

---

#### 💡 B. Mesa de Luz com Calibração Física de Escala
A proposta menciona validação de zoom em milímetros com `device pixel ratio`. Expandindo isso:

- **Calibração por referência:** Ao ativar a Mesa de Luz, exibir um objeto de tamanho conhecido na tela (ex: "coloque uma moeda de R$1 sobre o círculo — ajuste até encaixar perfectly"). Isso calibra com precisão a escala física **sem depender de metadados do dispositivo**.
- **Overlay de grade física:** Exibir linhas de régua em cm reais sobre o molde durante a transferência.

---

#### 🖼️ C. Visualizador de Molde "Colocado no Tecido"
Antes de ativar a Mesa de Luz, oferecer uma **prévia AR/pseudo-AR** onde o molde aparece sobreposto à câmera em escala real, simulando como ficaria no tecido. Tecnicamente possível via `getUserMedia` + Canvas.

---

#### ⭐ D. Baú Pessoal com Caderno de Bordado
O "Baú Pessoal" (favoritos) pode evoluir sem sair do escopo:
- **Notas pessoais** por risco (ex: "uso linha DMC 321 neste molde")
- **Tags pessoais** (diferente das tags curatoriais da plataforma)
- **Histórico de uso:** quantas vezes ativou a Mesa de Luz para aquele molde

---

#### 📱 E. Modo Offline-First para Riscos Favoritos
Como é uma PWA, `Service Workers` podem cachear os riscos favoritos. A usuária acessa seus moldes mesmo sem internet — crítico para voluntárias em locais com conectividade intermitente.

---

### 4.2 Possibilidades de Features Técnicas

#### 🔒 F. "Trava de Segurança" da Mesa de Luz — Variações de Interação
A proposta define "toque longo no centro" para sair da Mesa de Luz. Variações possíveis:
- **Padrão de toque:** ex: 3 toques rápidos no canto
- **Botão físico de volume:** detectável via `MediaSession API` como um evento de "retroceder"
- **Timer de inatividade total:** sai automaticamente após X minutos sem detecção de toque de caneta/lápis (para não travar o dispositivo acidentalmente)

---

#### 🔄 G. Upload de Risco pela Usuária (Conteúdo UGC Curado)
Embora a proposta diga que *"a plataforma controla as dimensões temáticas para evitar desorganização sistêmica gerada por usuários"*, isso não impede um fluxo de **submissão com moderação**:
1. Usuária envia um risco próprio
2. Fica em fila de curadoria
3. A plataforma aprova/rejeita e classifica
4. Crédito à criadora exibido na listagem

Isso cria uma **comunidade de autoras** sem abrir mão do controle curatorial.

---

#### 📊 H. Métricas de Uso da Mesa de Luz (Analytics de Domínio)
Como `Light Table Session` é uma entidade de domínio, cada ativação pode emitir eventos ricos:
- Duração da sessão
- Qual molde foi usado
- Device type (tablet vs. phone)
- Se Wake Lock foi suportado ou degradado graciosamente

Dados que informam decisões futuras de produto sem violar privacidade (anônimos, agregados).

---

### 4.3 Possibilidades de IA / Visão Computacional (Roadmap)

> A proposta já antecipa essa janela: *"Python permite futuramente adição fácil de IA ou Visão Computacional"*

#### 🤖 I. "Digitalizador de Risco" — Foto → Vetor
O fluxo seria:
1. Usuária fotografa um risco de um livro/revista antigo com o celular
2. Backend processa via `OpenCV` + `scikit-image` (ou API externa) para extrair traços
3. Resultado exportado como SVG limpo, catalogável na plataforma
4. Curadoria valida e publica

**Impacto:** Transforma material analógico legado em patrimônio digital da comunidade.

---

#### 🎨 J. Sugestão de Paleta de Cores para o Molde
Dado um risco catalogado, o sistema sugere combinações de cores de fio:
- Usando paletas pré-definidas (ex: baseadas em teorias de cores)
- Ou com modelo generativo leve (ex: `CLIP` para descrever o molde → sugestão de fios)
- Exibindo swatches visuais com referências de marcas populares (DMC, Anchor)

---

#### 🔎 K. Busca por Semelhança Visual
Em vez de buscar por texto ("búzio", "flor"), a usuária fotografa um bordado que viu na rua e o sistema encontra riscos **visualmente similares** no catálogo. Tecnicamente: `CLIP embeddings` + busca vetorial (pgvector).

---

### 4.4 Possibilidades de Comunidade e Social

#### 👥 L. Grupos de Voluntariado (Multi-tenant Leve)
Para o público indireto (organizações voluntárias), uma feature de **Grupo**:
- Admin do grupo cria uma coleção fechada de riscos
- Voluntárias do grupo acessam via link de convite
- Admin marca quais riscos estão em andamento / concluídos (gestão de mantas)

---

#### 🏆 M. "Bordado do Mês" — Desafio Comunitário
Um risco em destaque por período com call-to-action para as usuárias ativarem a Mesa de Luz e compartilharem fotos do resultado. Leve, curatorial, sem competição explícita.

---

#### 🎓 N. Trilha de Pontos (Tutoriais Integrados)
Cada risco pode ter **metadados de ponto de bordado sugerido** (Ponto Cruz, Ponto Cheio, Margarida…). A plataforma poderia oferecer micro-tutoriais em vídeo/GIF associados ao risco descoberto — enriquecimento educacional sem sair do fluxo de descoberta.

---

### 4.5 Possibilidades de Monetização (Dentro do Escopo)

#### 💰 O. Modelo Freemium por Coleções Premium
- **Free:** Acesso a coleções base + Mesa de Luz básica
- **Premium:** Coleções exclusivas, SVGs em alta resolução, download offline ilimitado
- **Organizações:** Plano de grupo com funcionalidade multi-tenant

---

#### 🎁 P. Marketplace de Artesãs (Extensão Natural)
Artesãs criadoras vendem seus riscos exclusivos diretamente pelo sistema. A plataforma toma uma comissão. O sistema de moderação de UGC (item G) é o pré-requisito.

---

## 5. Mapa de Priorização Sugerida

```
Alta Viabilidade Agora          Alta Viabilidade Futuro
────────────────────────        ─────────────────────────
A: Onboarding guiado            I: Digitalizador Foto→Vetor
B: Calibração física            K: Busca visual por semelhança
D: Baú com notas pessoais       P: Marketplace
E: Offline-First (PWA)          J: Sugestão de Paleta (IA)
F: Variações de trava de saída
G: UGC com moderação
H: Analytics de sessão
L: Grupos de voluntariado
```

---

## 6. Riscos e Tensões Identificados

| Tensão | Descrição |
|--------|-----------|
| **DDD vs. Velocidade** | A proposta reconhece: DDD gera boilerplate desproporcional para CRUDs simples. Avaliar onde aplicar o padrão apenas nas entidades de domínio reais. |
| **Wake Lock + Safari iOS** | Suporte limitado no Safari iOS. Graceful Degradation obrigatória (item 6 da proposta). |
| **UGC vs. Controle Curatorial** | Upload por usuárias cria sobrecarga de moderação. Feature G exige fluxo editorial bem definido. |
| **Privacidade Analytics** | Dados de sessão da Mesa de Luz (item H) devem ser anonimizados por padrão. |
| **Letramento Digital 50+** | Qualquer feature nova (IA, AR, Grupos) deve ser avaliada contra a barreira cognitiva da usuária primária. |

---

## 7. Perguntas para Próxima Rodada de Clarificação

*(Uma por vez, conforme a skill de brainstorming)*

1. Das possibilidades listadas acima, **qual grupo temático prioriza para o MVP?** (A: UX pura / B: Mesa de Luz avançada / C: Comunidade / D: IA futura)
2. O "Baú Pessoal" terá **sincronização entre dispositivos** (exige auth) ou poderá funcionar apenas localmente no navegador (sem auth)?
3. A funcionalidade de **upload por usuárias** (UGC) está dentro ou fora do escopo do MVP declarado?
4. Há **orçamento/prazo específico** de MVP que condicione quais features são viáveis agora?

---

## 8. 📋 Decision Log

| # | Decisão | Alternativas Consideradas | Motivo |
|---|---------|--------------------------|--------|
| 1 | **MVP foca exclusivamente em UX (Grupo A)** | B (Mesa avançada), C (Comunidade), D (IA) | Restrição de orçamento: 60 horas de desenvolvimento |
| 2 | Funcionalidades de IA, comunidade e monetização são **pós-MVP** | — | YAGNI: complexidade desproporcional ao tempo disponível |
| 3 | **Auth é opcional no MVP** — sem login: favoritos locais (`localStorage`); com login (OAuth/Magic Link): sincronizado | A (só local), B (obrigatório) | Protege a jornada da usuária 50+ sem forçar cadastro; progressão natural |
| 4 | **Mesa de Luz: core mínimo + zoom calibrado** — tela cheia + Wake Lock + `devicePixelRatio` para escala real + bloqueio scroll/pinch + saída por toque longo | Sem calibração | Mantém invariante de domínio da proposta; zoom é parte do valor real da feature |
| 5 | **Safari iOS:** banner de aviso proativo quando Wake Lock não é suportado; suporte completo fora do escopo | Full graceful degradation | Resolve contradição com a proposta de forma mínima; usuária é informada sem catástrofe silenciosa |
| 6 | **Sugestões de Pontos, metadados cm², migração localStorage→servidor:** tratados conforme facilidade da stack no `design.md` | Especificação antecipada | YAGNI — detalhes de implementação, não decisões de produto |
| 7 | **DDD/Clean Architecture:** nível pragmático — separação de camadas clara (Domain / Application / Infra) sem boilerplate excessivo de Repositories para CRUDs simples | DDD estrito | Proposta já reconhece o custo de boilerplate como fraqueza; 60h impõe equilíbrio |

---

## ✅ Brainstorming Encerrado

**Todas as condições de saída satisfeitas:**
- [x] Understanding Lock confirmado
- [x] Abordagem de design aceita
- [x] Suposições documentadas
- [x] Riscos principais endereçados
- [x] Decision Log completo

**Próximo artefato:** `design.md` — especificação OpenAPI + arquitetura de componentes

---

## 🔒 Understanding Lock — Verificação de Entendimento

> *(Passo obrigatório da skill de brainstorming antes de qualquer design)*

### Resumo do que está sendo construído

- **O quê:** PWA de bordado manual com catálogo de moldes (riscos) e ferramenta de Mesa de Luz móvel
- **Por quê:** Substituir a fragmentação de redes sociais por uma interface curada focada em descoberta + resolver a dor mecânica de transferir moldes para tecido sem impressora
- **Para quem:** Mulheres 50+, letramento digital básico-moderado; secundariamente, organizações voluntárias
- **Restrição:** 60 horas de desenvolvimento total — escopo mínimo viável com máxima qualidade de UX
- **Não-objetivos do MVP:** IA/Visão Computacional, UGC/upload de riscos, Grupos de voluntariado, Marketplace, calibração física por referência externa, suporte completo ao Safari iOS

### Features confirmadas para o MVP

| Feature | Descrição |
|---------|-----------|
| Catálogo de Riscos | Lista/grid de moldes curados, com busca e filtro por coleção/tema |
| Onboarding Guiado | 2–3 perguntas visuais para personalizar a descoberta inicial |
| Mesa de Luz | Tela cheia + Wake Lock + `devicePixelRatio` para escala real + bloqueio scroll/pinch + saída por toque longo + banner de aviso no Safari iOS |
| Baú Pessoal | Favoritos em `localStorage` (sem auth) ou sincronizados (com auth); migração local→servidor no primeiro login |
| Auth Opcional | OAuth Google / Magic Link — não obrigatório para usar o catálogo |

### Suposições explícitas

1. O catálogo de riscos é gerenciado pela plataforma (sem upload de usuárias no MVP)
2. Os moldes são servidos como imagens (JPG/PNG/SVG) — sem processamento vetorial
3. A stack confirmada (FastAPI + Next.js) é adequada ao orçamento de 60h com os integrantes do time
4. Não há necessidade de internacionalização (pt-BR é o único idioma)
5. Graceful Degradation (Wake Lock + Safari iOS) entra como dívida técnica documentada, não bloqueante

---

## 9. Próximo Passo Natural

Com base na proposta sancionada, o próximo artefato esperado é o **`design.md`** — especificação OpenAPI das entidades e endpoints. As possibilidades levantadas aqui devem ser contrastadas com as respostas às perguntas acima antes de decidir o escopo do `design.md`.

---

*Brainstorming session · Fio & Luz · 2026-03-10 · Antigravity*
