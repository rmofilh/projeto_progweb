# Proposta Técnica Executiva: Sistema de Apoio ao Bordado Manual (Fio & Luz)

## 1. Introdução

O presente documento propõe a arquitetura e a execução de uma aplicação web full-stack comercialmente viável e socialmente impactante, doravante denominada **"Fio & Luz"**. O sistema visa suprir as necessidades de praticantes de bordado livre, oferecendo um catálogo digital curado de moldes (riscos) e, como diferencial tecnológico primário, uma ferramenta de hardware-software integrada batizada de "Mesa de Luz Móvel". 

A fundação do projeto pauta-se nos princípios de controle estrito de estado, tipagem forte de ponta a ponta (end-to-end type safety) e na segregação das lógicas de negócio central através do Domain-Driven Design (DDD) e Clean Architecture, garantindo escalabilidade e facilidade de manutenção a longo prazo.

## 2. Objetivo do Sistema

Desenvolver e implantar uma Progressive Web App (PWA) de alta resiliência e acessibilidade. O sistema resolve dois problemas centrais:
1. **Curadoria Visual:** Substituir a fragmentação e sobrecarga cognitiva de redes sociais genéricas por uma interface limpa, focada exclusivamente na descoberta de riscos catalogados.
2. **Transferência de Moldes (The "Light Table"):** Utilizar APIs nativas dos navegadores modernos (como *Screen Wake Lock API* e isolamento de eventos Touch/Pointer no DOM) para converter tablets e smartphones em mesas de luz efetivas. Isso resolve a dor mecânica de transferir o desenho do papel/tela para o tecido, garantindo que o dispositivo não entre em repouso (apagando a tela) e não reaja erroneamente a toques da mão sobre a tela durante o decalque.

## 3. Público-Alvo e Segmentação

A engenharia de requisitos prioriza as barreiras cognitivas e operacionais do usuário primário, ditando as escolhas de UX/UI.

### 3.1 Usuária Principal
- **Demografia:** Mulheres com idade igual ou superior a 50 anos, muitas delas dedicadas ao voluntariado e atividades manuais domésticas.
- **Relação com o Ofício:** Praticam o bordado de forma analógica, por hobby ou propósito social, sem viés estritamente comercial.
- **Letramento Digital:** Classificado como Básico a Moderado. Consumidoras de redes sociais, porém suscetíveis a paralisia decisória diante de fluxos complexos, modais intrusivos ou jargões da indústria ("Sign-up", "Dashboard").
- **Necessidade (Jobs to be Done):** "Preciso encontrar um molde bonito rapidamente e passá-lo para o tecido sem depender de impressora ou de interfaces confusas".

### 3.2 Público Indireto
- **Organizações Voluntárias:** Entidades que orientam a confecção de mantas/roupas doadas e necessitam de uma plataforma central para distribuir riscos padronizados para suas voluntárias (nossas usuárias principais).

## 4. Funcionalidades Principais (Domínio e Casos de Uso)

A abstração das regras de negócio (Core Domain) isola a complexidade da "Mesa de Luz" e da "Curadoria" dos detalhes de implementação (Banco de dados ou UI).

### 4.1 Entidades Núcleo (Core Domain - DDD)
1. **Risco (Pattern):** O ativo digital central.
   - *Invariantes de Domínio:* Criação exige arquivo vetorial/imagem limpa e metadados de proporção ideal (ex: cm² para bastidor).
2. **Coleção Temática (Collection):** Agregador curcionado de Riscos e Sugestões de Pontos. A plataforma controla as dimensões temáticas ("Natal", "Iniciantes") para evitar desorganização sistêmica gerada pelos usuários.
3. **Mesa de Luz (Light Table Session):** Entidade de estado eólica. Controla o ciclo de vida da transferência.
   - *Invariantes:* Valida cálculos de zoom em milímetros com base no *device pixel ratio* para garantir escala física real.

### 4.2 Interatores Core (Use Cases)
*   **Descoberta Rápida (Discovery):** A aplicação recupera e expõe Coleções. A interface maximiza "touch targets" (> 48px) e exige proporção de contraste AAA em todos os elementos tipográficos, aderindo rigorosamente às necessidades visuais de usuárias 50+.
*   **Ativação da Mesa de Luz:** 
    1. A usuária comanda a transferência.
    2. O frontend despacha injecões imperativas: oculta *todas* as barras de navegação, ativa o *Wake Lock* (travando o brilho da tela no máximo e impedindo suspensão) e desabilita APIs de scroll/pinch.
    3. Para sair, exige-se uma interação intencional de mitigação de erro (ex: toque longo no centro do desenho).
*   **Baú Pessoal (Low-Friction Auth):** As usuárias podem favoritar Riscos. A autenticação descarta a gerência arcaica de senhas, operando nativamente via oAuth (Single Sign-On Google) ou *Magic Links* enviados por e-mail, reduzindo em 80% as quebras na jornada do usuário.

## 5. Tecnologias e Arquitetura

Para assegurar velocidade no ciclo de vida do desenvolvimento sem sacrificar robustez, a stack selecionada favorece ecossistemas maduros, isolamento de escopo e facilidade de deploy.

### 5.1 Backend (Serviços e API)
- **Runtime & Framework:** Python 3.10+ acoplado ao poderoso **FastAPI** (ASGI/Uvicorn). Escolhido pelo throughput assíncrono excelente e suporte nativo a diagramação OpenAPI e JSON Schema automáticas.
- **Tipagem & Mapeamento Estrutural:** A biblioteca **Pydantic** será o motor universal de validação de Request/Response, garantindo inviolabilidade estrutural alinhada às Entidades de Domínio.
- **Persistência Relacional:** O estado transacional (Usuários, Favoritos, Catálogo) reside em banco de dados **PostgreSQL**. A API interage através do ORM (ex: SQLAlchemy ou SQLModel), blindado por Padrões Repository baseados em interfaces.

### 5.2 Frontend e Client-Side
- **Framework & Renderização:** A abstração do frontend será regida pelo **Next.js** (App Router). Páginas de catálogo intensamente cacheadas com ISR/SSG garantem sub-second Time to First Byte (TTFB), vital para retenções em conexões intermitentes (mobile).
- **Abordagem UI/Estilização:** TypeScript estrito com **TailwindCSS** provém a base visual. Opta-se pela biblioteca **Shadcn/UI** (baseada no Radix) pela primazia atestada na entrega de componentes WAI-ARIA complacentes prontos (acessibilidade garantida por design).

### 5.3 Infraestrutura de Operações (DevOps)
- **Containerização:** Os ambientes de backend serão englobados em containers **Docker** (padrão multi-stage builds para diminuir o tamanho da imagem do runner). 
- **Integração/Entrega Contínua:** Controle total sobre versão no repositório GitHub acoplado à esteira **GitHub Actions**. Pipelines obrigatórios executando o core das validações vitais (testes unitários dos casos de uso) para liberar artefatos de deploy contínuo em ambientes como Vercel (Front) e Cloud providers adequados (Backend).

## 6. Considerações Finais e Análise de Risco

Como arquiteto encarregado por avaliar a fundação da presente proposta, destaco os vetores essenciais de planejamento usando o quadrante SWOT:

*   **(S) Forças (Strengths):** A associação entre FastAPI e Next.js via tipagem TypeScript+Pydantic estirpará classes inteiras de erros silenciosos. PWA permite acessibilidade ubíqua sem bloqueios impostos pelas *App Stores*.
*   **(W) Fraquezas (Weaknesses):** O dogma do DDD e a abstração promovida pelo Clean Architecture implicam numa complexidade inicial e verborragia considerável ("Boilerplate"). Para CRUDs simples, o custo cognitivo imposto à engenharia de software será temporariamente desproporcional.
*   **(O) Oportunidades (Opportunities):** O uso da linguagem Python em todo o backend permite futuramente a fácil adição de scripts de Inteligência Artificial ou Visão Computacional (ex: extrair os traços vetoriais de uma fotografia tirada na hora pelo próprio celular do usuário).
*   **(T) Ameaças (Threats):** Componentes fundamentais como o *Screen Wake Lock* ainda detêm suporte variável em navegadores proprietários nativos ou desatualizados (ex: versões restritas de Safari iOS). Uma estratégia de *Graceful Degradation* (avisar proativamente ao usuário para travar a tela nas configurações do celular se a API falhar) é obrigatória para prevenir catástrofes de operação.

Em suma, as engrenagens técnicas estipuladas suportam plenamente uma aplicação modular, testável em altíssima velocidade local via testes unitários Python, focando esforço real da engenharia na refinação obsessiva da UX (Design da Mesa de Luz). A proposta está sancionada para progredir em direção a prototipação arquitetural OpenAPI (`design.md`).
