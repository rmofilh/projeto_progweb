# Apresentação: Backend Fio & Luz — Arquitetura, Domínio e Casos de Uso

---
Explicar rapidamente as bibliotecas e seu uso em (requirements.txt)
TDD
---
## Slide 1 — Introdução: O Que é o Fio & Luz?

**Fio & Luz** é uma Progressive Web App (PWA) projetada para bordadeiras e artesãs. Sua função principal é emular uma mesa de luz física diretamente na tela do dispositivo móvel, permitindo que a usuária decalque moldes (riscos) sobre tecido sem equipamentos adicionais.

O backend é o núcleo responsável por:
- Gerir identidade de usuárias sem senha, via Magic Link
- Servir o catálogo de moldes e coleções
- Persistir e gerenciar o "Baú Pessoal" (favoritos)
- Coordenar o processamento assíncrono de operações pesadas

**Stack técnica do backend:**
- Linguagem: Python 3.10
- Framework Web: FastAPI (ASGI)
- ORM: SQLModel (sobre SQLAlchemy 2.0)
- Driver de Banco: asyncpg (PostgreSQL assíncrono)
- Segurança: JWT (python-jose)
- Containerização: Docker + Docker Compose

---

## Slide 2 — Clean Architecture: O Princípio Central

A **Clean Architecture**, proposta por Robert C. Martin (Uncle Bob), organiza o código em camadas concêntricas onde a **regra de ouro** é: dependências apontam **sempre para dentro**. O código interno (domínio) não conhece nada do código externo (banco, HTTP, frameworks).

As quatro camadas, de dentro para fora:

```
┌────────────────────────────────────────────┐
│  4. Frameworks & Drivers (FastAPI, asyncpg) │
│  ┌──────────────────────────────────────┐  │
│  │  3. Interface Adapters (API Routes)  │  │
│  │  ┌────────────────────────────────┐  │  │
│  │  │  2. Use Cases (Services)       │  │  │
│  │  │  ┌──────────────────────────┐  │  │  │
│  │  │  │  1. Entities (Domain)    │  │  │  │
│  │  │  └──────────────────────────┘  │  │  │
│  │  └────────────────────────────────┘  │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

No projeto, esse mapeamento é **estrutural** — cada pasta corresponde a uma camada:

| Camada (Uncle Bob)       | Pasta no Projeto                      | Responsabilidade                              |
|--------------------------|---------------------------------------|-----------------------------------------------|
| Entities (Domínio)       | `backend/domain/`                     | Modelos de negócio e schemas de validação     |
| Use Cases                | `backend/services/`                   | Regras de negócio e orquestração              |
| Interface Adapters       | `backend/api/` + `backend/repositories/` | Rotas HTTP e abstração de persistência     |
| Frameworks & Drivers     | `backend/core/` + `backend/workers/`  | Banco de dados, broker, infraestrutura        |

---

## Slide 3 — Camada 1: Domínio (`domain/`)

O domínio é o coração do sistema. Ele não importa nenhum módulo externo além de tipos primitivos e do SQLModel. Aqui vivem as **entidades de negócio** e os **contratos de dados**.

### 3.1 — Entidades (`domain/models.py`)

São as classes que mapeiam as tabelas do PostgreSQL. O SQLModel unifica ORM e validação Pydantic numa única declaração de classe.

**`User`** — Identidade da usuária. Identificação por e-mail, sem senha:

```python
class User(SQLModel, table=True):
    __tablename__ = "users"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None
    patterns: List["Pattern"] = Relationship(...)
```

**`Pattern`** — Entidade raiz chamada `Risco` no domínio. Contém o invariante de escala física (`scale_cm_reference`) e validação de dificuldade no próprio campo:

```python
class Pattern(SQLModel, table=True):
    __tablename__ = "patterns"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    difficulty_level: int = Field(ge=1, le=5)  # Invariante de domínio embutido no ORM
    scale_cm_reference: float
    ...
```

**`UserPattern`** — Tabela de junção que realiza o agregado "Baú Pessoal". Guarda o estado do processamento assíncrono de cada favorito:

```python
class UserPattern(SQLModel, table=True):
    __tablename__ = "user_patterns"
    user_id: UUID = Field(foreign_key="users.id", primary_key=True)
    pattern_id: UUID = Field(foreign_key="patterns.id", primary_key=True)
    status: str = Field(default="PROCESSING")  # Máquina de estados: PROCESSING → DONE / FAILED
    synced_offline: bool = Field(default=False)
```

**`MagicLink`** — Token de autenticação de uso único (OTP):

```python
class MagicLink(SQLModel, table=True):
    token: str = Field(index=True)
    expires_at: datetime
    used: bool = Field(default=False)
```

### 3.2 — Schemas de Contrato (`domain/schemas.py`)

Os schemas Pydantic definem **o que entra e o que sai** da API — são os contratos HTTP que separam a representação de rede da entidade de banco.

- **`AuthRequest`**: valida que o e-mail recebido via POST é um `EmailStr` válido. Qualquer entrada fora do padrão retorna HTTP 422 automaticamente pelo FastAPI.
- **`TokenResponse`**: controla o shape exato da resposta de autenticação.
- **`PatternBase` → `PatternCreate` → `PatternResponse`**: hierarquia de schemas com herança. `PatternCreate` adiciona campos obrigatórios de upload; `PatternResponse` é o shape de saída tipado para o cliente.

> **Por que isso é Clean Architecture?** O domínio não sabe que existe FastAPI, PostgreSQL ou HTTP. Ele apenas descreve o negócio em termos de Python puro. Qualquer parte do sistema pode ser substituída sem tocar nessas classes.

---

## Slide 4 — Camada 2: Casos de Uso (`services/`)

Os services são os **casos de uso** da aplicação. Cada método de service representa exatamente uma ação de negócio. Eles:
- Recebem dados já validados (vindos da camada de API)
- Orquestram repositórios, regras e eventos
- Nunca lidam diretamente com HTTP, JSON cru ou SQL

### 4.1 — `AuthService` (`services/auth.py`)

Implementa três casos de uso de autenticação:

**Caso de Uso 1: Solicitar Magic Link**

```
get_or_create_user(email) → create_magic_link(user_id)
```

A lógica `get_or_create_user` é idempotente: se a usuária já existe, retorna; se não, cria. Isso elimina a distinção entre "cadastro" e "login" — um design intencional para o público 50+.

**Caso de Uso 2: Verificar Token e Emitir JWT**

```
verify_magic_link(token) → valida expiração + marca como usado → retorna User
```

A verificação executa três passos atômicos: (1) buscar o token indexado no banco, (2) checar `expires_at` contra o horário atual (janela de 15 minutos), (3) marcar `used=True` para invalidar reutilização. Após confirmação, atualiza `last_login_at` da usuária.

**Caso de Uso 3: Criar Access Token**

```python
def create_access_token(self, data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": expire})  # claim padrão JWT de expiração
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
```

JWT assinado com HS256, expiração de 7 dias, `sub` contendo o UUID da usuária.

### 4.2 — `FavoriteService` (`services/favorites.py`)

É o caso de uso mais rico do sistema. Orquestra quatro decisões de negócio em sequência obrigatória:

```
1. Checar limite       → (≥ 100 favoritos) → retorna erro de negócio
2. Checar idempotência → (já existe)       → retorna status already_favorited
3. Persistir PROCESSING (Outbox Pattern)
4. Publicar evento no broker com correlation_id
```

**Regra de negócio — limite de 100 favoritos**: verificada pelo service *antes* de qualquer I/O de escrita. A mesma regra também existe no banco como trigger PostgreSQL — duas linhas de defesa independentes.

**Idempotência**: se a requisição chega duplicada por retry do cliente ou falha de rede, o service detecta o registro existente e retorna `already_favorited` sem criar duplicata.

**Outbox Pattern**: o registro é gravado com `status=PROCESSING` *antes* de ser enviado ao broker. Se o broker falhar, o dado já está no banco e pode ser reprocessado com segurança.

### 4.3 — `PatternService` (`services/patterns.py`)

Casos de uso de leitura do catálogo:
- `get_all_patterns(collection_id?)` — lista moldes com filtro opcional por coleção
- `get_pattern_by_id(pattern_id)` — retorna um molde específico ou None
- `get_all_collections()` — lista todas as coleções disponíveis

> **Ponto Clean Architecture**: o service não importa SQLAlchemy. Chama `self.repository.get_all()` sem saber se os dados vêm de PostgreSQL, arquivo JSON ou um mock de testes.

### 4.4 — `MessageBroker` (`services/messaging.py`)

Implementa mensageria com envelope padronizado e rastreabilidade fim-a-fim:

```python
envelope = {
    "correlation_id": correlation_id,   # ID único desta transação em todos os logs
    "metadata": {
        "timestamp": datetime.utcnow().isoformat(),
        "topic": topic,
        "environment": "development-mock"
    },
    "data": payload
}
```

O broker atual é **mock** (imprime no console), mas o contrato do envelope é rigorosamente idêntico ao que seria usado com Redis ou RabbitMQ em produção. A transição é **puramente de infraestrutura** — nenhum service ou worker muda.

---

## Slide 5 — Camada 3: Interface Adapters

### 5.1 — Rotas HTTP (`api/routes/`)

As rotas são **controladores finos**: recebem a requisição HTTP, delegam ao service e devolvem a resposta. Nenhuma lógica de negócio vive aqui.

**`routes/auth.py`:**

- `POST /v1/auth/magic-link` — recebe `AuthRequest` validado automaticamente, instancia `AuthService` e delega:

```
AuthRequest(email) → AuthService.get_or_create_user() → create_magic_link() → HTTP 200
```

- `POST /v1/auth/verify` — recebe token, delega verificação, retorna `TokenResponse` (JWT):

```
token → AuthService.verify_magic_link() → create_access_token() → TokenResponse
                                       ↓ (token inválido/expirado)
                                       HTTP 401 Unauthorized
```

**`routes/favorites.py`:**

- `POST /v1/favorites/{pattern_id}` — rota protegida por JWT. Gera `correlation_id` na fronteira da API:

```
Bearer Token → Depends(get_current_user) → FavoriteService.add_favorite() → HTTP 202
```

**`routes/patterns.py`:**

Rotas públicas (sem autenticação), delegam ao `PatternService`:
- `GET /v1/patterns` — lista com filtro opcional `?collection_id=...`
- `GET /v1/patterns/{id}` — detalhe (HTTP 404 se não encontrado)
- `GET /v1/collections` — lista de coleções

### 5.2 — Repositórios (`repositories/`)

Os repositórios abstraem toda persistência, isolando SQL dos services.

**`FavoriteRepository`:**
- `get_count_for_user(user_id)` → `SELECT COUNT(*)` para checar limite
- `get_by_user_and_pattern(user_id, pattern_id)` → checa idempotência antes do INSERT
- `add(user_id, pattern_id)` → persiste novo favorito com `status=PROCESSING`

**`PatternRepository`:**
- `get_all(collection_id?)` → lista com filtro dinâmico opcional
- `get_by_id(pattern_id)` → busca por PK, retorna `None` se não encontrado
- `get_collections()` → todas as coleções disponíveis

> **Inversão de Dependência**: o `FavoriteService` recebe `AsyncSession` no construtor e cria o repositório internamente. O service poderia ser testado com um repositório mock sem qualquer alteração.

---

## Slide 6 — Inversão de Dependência na Prática: `Depends()`

O FastAPI implementa **Injeção de Dependência** nativamente via `Depends()`. Isso resolve o princípio D do SOLID sem necessidade de container IoC externo.

**1. A sessão de banco é injetada pela infraestrutura:**

```python
# core/database.py — Camada de Infraestrutura
async def get_session():
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session   # Context manager garante fechamento e rollback automático
```

**2. O usuário autenticado é injetado pelo adapter:**

```python
# api/dependencies.py — Interface Adapter
async def get_current_user(
    token: str = Depends(oauth2_scheme),        # extrai Bearer token do header Authorization
    session: AsyncSession = Depends(get_session) # injeta sessão de banco
) -> User:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("sub")
    # busca o usuário no banco pelo UUID e o retorna
```

**3. A rota declara o que precisa e recebe os objetos prontos:**

```python
@router.post("/{pattern_id}", status_code=202)
async def favorite_pattern(
    pattern_id: uuid.UUID,
    current_user: User = Depends(get_current_user), # usuário já autenticado e carregado
    session: AsyncSession = Depends(get_session)    # sessão já aberta e gerenciada
):
    # A rota não sabe como o usuário foi autenticado nem como a sessão foi criada
    service = FavoriteService(session)
    ...
```

> **Impacto**: a rota não sabe que existe JWT. O service não sabe que existe HTTP. O repositório não sabe que existe um service. Cada camada conhece apenas a interface da camada imediatamente abaixo.

---

## Slide 7 — Infraestrutura (`core/` + `workers/`)

### 7.1 — Banco de Dados (`core/database.py`)

Inicialização assíncrona via `lifespan` do FastAPI. Na inicialização da aplicação, três operações são executadas em ordem garantida:

```
1. SQLModel.metadata.create_all     → cria tabelas se não existirem
2. CREATE FUNCTION check_user_favorites_limit()   → função PL/pgSQL de validação
3. CREATE TRIGGER trg_limit_user_favorites         → BEFORE INSERT em user_patterns
```

**O Trigger como segunda linha de defesa:**

```sql
CREATE OR REPLACE FUNCTION check_user_favorites_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT count(*) FROM user_patterns WHERE user_id = NEW.user_id) >= 100 THEN
        RAISE EXCEPTION 'Limite de 100 favoritos atingido para este usuário.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

A regra de 100 favoritos existe em dois lugares completamente independentes:
- **Service** (`FavoriteService`): primeira verificação em Python, antes do INSERT — resposta rápida com mensagem amigável
- **Banco** (trigger PostgreSQL): garantia absoluta que não pode ser contornada por nenhum bug na camada de aplicação

### 7.2 — Worker Assíncrono (`workers/favorite_worker.py`)

Processo separado que consome eventos da fila e executa trabalho pesado (geração de assets, cruzamento de metadados, preparação para modo offline).

**Fluxo completo do worker:**

```
1. Recebe envelope com correlation_id da fila
2. Extrai user_id e pattern_id do payload
3. Abre AsyncSession independente (não compartilha com a API)
4. SELECT user_patterns → (não encontrado: descarta o evento)
5. Checa status == "DONE" → (idempotência: ignora reprocessamento)
6. Executa trabalho pesado (simulado por asyncio.sleep(2))
7. Atualiza status para "DONE" e faz commit
8. Em caso de exceção: rollback + move envelope para DLQ
```

**Idempotência no worker**: o worker relê o estado no banco antes de executar. Se o evento chegar duas vezes por retry de rede, o segundo processamento é silenciosamente ignorado — o sistema garante que o trabalho nunca é duplicado.

**Dead Letter Queue (DLQ)**: em caso de falha irrecuperável, o rollback é feito e o envelope original (com todos os dados e `correlation_id`) é movido para a fila `dlq_favorites` para intervenção manual segura. Nenhum payload é perdido.

---

## Slide 8 — Linha do Tempo da Jornada do Usuário

Acompanhamento de todos os caminhos de uma requisição, do cliente até o banco de dados.

---

### Caminho 1: Cadastro e Autenticação (Magic Link)

```
Usuária digita e-mail no frontend
        │
        ▼
POST /v1/auth/magic-link
  └─ FastAPI valida AuthRequest
     └─ email inválido → HTTP 422 (automático pelo Pydantic)
     └─ email válido → injeta AsyncSession via Depends(get_session)
        └─ instancia AuthService(session)
        │
        ▼
AuthService.get_or_create_user(email)
  └─ SELECT users WHERE email = ?
  └─ (não existe) → INSERT INTO users → commit → refresh
  └─ (existe)     → retorna usuário já cadastrado
        │
        ▼
AuthService.create_magic_link(user_id)
  └─ token = str(uuid.uuid4())
  └─ expires_at = utcnow() + 15 minutos
  └─ INSERT INTO magic_links
  └─ [EMAIL SIMULATION] imprime link no log do servidor
        │
        ▼
HTTP 200: {"message": "If the email is registered, you will receive a login link"}
```

---

### Caminho 2: Verificação do Token e Emissão de JWT

```
Usuária clica no link → frontend extrai o token e envia
        │
        ▼
POST /v1/auth/verify?token=<uuid>
  └─ injeta AsyncSession
  └─ instancia AuthService(session)
        │
        ▼
AuthService.verify_magic_link(token)
  └─ SELECT magic_links WHERE token = ? AND used = FALSE
  └─ (não encontrado) ──────────────────────── HTTP 401 Unauthorized
  └─ (encontrado)     → checa expires_at < utcnow()
                        └─ (expirado) ────────── HTTP 401 Unauthorized
                        └─ (válido)  →
                              magic_link.used = True → add → commit
                              SELECT users WHERE id = magic_link.user_id
                              user.last_login_at = utcnow() → commit
        │
        ▼
AuthService.create_access_token({"sub": str(user.id)})
  └─ JWT HS256, expira em 7 dias, claim "sub" = user_id
        │
        ▼
HTTP 200: TokenResponse {"access_token": "eyJ...", "token_type": "bearer"}
```

---

### Caminho 3: Consulta ao Catálogo (rota pública)

```
GET /v1/patterns?collection_id=<uuid>   ← sem autenticação necessária
        │
        ▼
FastAPI injeta AsyncSession
Instancia PatternService(session)
        │
        ▼
PatternService.get_all_patterns(collection_id=<uuid>)
  └─ delega para PatternRepository.get_all(collection_id)
     └─ SELECT * FROM patterns WHERE collection_id = ?
     └─ retorna lista de objetos ORM
        │
        ▼
FastAPI serializa via response_model=List[PatternResponse]
  └─ Pydantic converte ORM → JSON (from_attributes = True)
        │
        ▼
HTTP 200: [{"id": "...", "title": "...", "difficulty_level": 3, ...}, ...]

--- busca por ID ---

GET /v1/patterns/{pattern_id}
  └─ PatternRepository.get_by_id(pattern_id)
     └─ (não encontrado) → HTTP 404: {"detail": "Pattern not found"}
     └─ (encontrado)     → HTTP 200: PatternResponse
```

---

### Caminho 4: Favoritar um Molde (o fluxo completo)

```
POST /v1/favorites/{pattern_id}
Authorization: Bearer eyJ...
        │
        ├─── PASSO 1: AUTENTICAÇÃO (api/dependencies.py)
        │    Depends(get_current_user)
        │      └─ oauth2_scheme extrai token do header Authorization
        │      └─ jwt.decode(token, SECRET_KEY) → extrai user_id do claim "sub"
        │      └─ (JWTError ou user_id None) ──────────── HTTP 401
        │      └─ SELECT users WHERE id = user_id
        │         └─ (não encontrado) ─────────────────── HTTP 401
        │         └─ (encontrado) → injeta User na assinatura da rota
        │
        ├─── PASSO 2: CORRELATION ID (api/routes/favorites.py)
        │    correlation_id = str(uuid.uuid4())
        │    Identificador único que acompanha esta transação em todos os logs
        │
        ├─── PASSO 3: DELEGATE AO SERVICE (services/favorites.py)
        │    FavoriteService.add_favorite(user_id, pattern_id, correlation_id)
        │
        │    ├─── 3a. CHECAGEM DE LIMITE — Regra de Negócio 1
        │    │    FavoriteRepository.get_count_for_user(user_id)
        │    │      └─ SELECT COUNT(*) FROM user_patterns WHERE user_id = ?
        │    │      └─ (count >= 100) → retorna:
        │    │         {"status": "error", "message": "Limite de 100 favoritos..."}
        │    │
        │    ├─── 3b. CHECAGEM DE IDEMPOTÊNCIA — Regra de Negócio 2
        │    │    FavoriteRepository.get_by_user_and_pattern(user_id, pattern_id)
        │    │      └─ SELECT FROM user_patterns WHERE user_id=? AND pattern_id=?
        │    │      └─ (existe) → retorna:
        │    │         {"status": "already_favorited", "correlation_id": "..."}
        │    │
        │    ├─── 3c. OUTBOX PATTERN — Persistência Inicial
        │    │    FavoriteRepository.add(user_id, pattern_id)
        │    │      └─ INSERT INTO user_patterns (status='PROCESSING')
        │    │      └─ TRIGGER EXECUTA: check_user_favorites_limit() — 2ª linha de defesa
        │    │      └─ commit() + refresh()
        │    │
        │    └─── 3d. PUBLICAÇÃO NO BROKER — Mensageria
        │         broker.publish("favorites_queue", payload, correlation_id)
        │           └─ monta envelope JSON com correlation_id + timestamp + dados
        │           └─ [BROKER MOCK] imprime no log do servidor
        │
        └─── PASSO 4: RETORNO IMEDIATO
             HTTP 202 Accepted
             {"status": "processing", "correlation_id": "abc-123-..."}
             O frontend pode usar o correlation_id para polling de status
```

---

### Caminho 5: Processamento Assíncrono (Worker)

```
[BROKER] Evento chega em "favorites_queue"
envelope = {correlation_id, data: {user_id, pattern_id}}
        │
        ▼
process_favorite_event(envelope)
  └─ Abre AsyncSession própria (independente da sessão da API)
        │
        ├─── IDEMPOTÊNCIA
        │    SELECT user_patterns WHERE user_id=? AND pattern_id=?
        │      └─ (não encontrado)     → descarta evento silenciosamente
        │      └─ (status == "DONE")   → ignora, já foi processado
        │      └─ (status == "PROCESSING") → continua
        │
        ├─── TRABALHO PESADO
        │    (geração de assets, cruzamento de metadados, prep offline)
        │    await asyncio.sleep(2)   ← simulado
        │
        ├─── SUCESSO
        │    user_pattern.status = "DONE"
        │    await session.commit()
        │    log: "[abc-123] Finalizado com Sucesso."
        │
        └─── FALHA (exceção capturada)
             await session.rollback()
             redis_client.lpush("dlq_favorites", json.dumps(envelope))
             log: "[abc-123] FAILED. Movido para DLQ: <erro>"
             O payload não é perdido — fica na DLQ para intervenção manual
```

---

## Slide 9 — Validação: Onde e Como

A validação ocorre em três camadas distintas e complementares:

| Camada | Mecanismo | Exemplo concreto | Quando dispara |
|--------|-----------|-----------------|----------------|
| **HTTP (entrada)** | Pydantic + FastAPI | `EmailStr` em `AuthRequest`; `Field(ge=1, le=5)` em `PatternBase` | Automático, antes de entrar na rota |
| **Negócio (service)** | Python no `FavoriteService` | Limite de 100 favoritos; idempotência de favorites | Dentro do método `add_favorite` |
| **Banco (última defesa)** | Trigger PL/pgSQL | `check_user_favorites_limit()` antes de cada INSERT | No banco, independente da aplicação |

**Exemplo end-to-end — validação de nível de dificuldade:**
1. No schema: `PatternBase.difficulty_level: int = Field(ge=1, le=5)` → recusa dados inválidos com HTTP 422
2. No ORM: `Pattern.difficulty_level: int = Field(ge=1, le=5)` → valida ao construir o objeto Python
3. No banco: o SQLModel mapeia isso para `CHECK (difficulty_level BETWEEN 1 AND 5)` no schema PostgreSQL

---

## Slide 10 — Estrutura de Arquivos Mapeada à Arquitetura

```
backend/
│
├── main.py                         ← Bootstrap da aplicação
│   └─ FastAPI app + lifespan (init BD) + registro de routers
│
├── core/                           ← INFRAESTRUTURA (camada mais externa)
│   └── database.py                 ← Engine asyncpg + create_db_and_tables() + Triggers SQL
│
├── domain/                         ← ENTIDADES (camada mais interna)
│   ├── models.py                   ← User, Pattern, Collection, UserPattern, MagicLink
│   └── schemas.py                  ← AuthRequest, TokenResponse, PatternBase/Create/Response
│
├── services/                       ← CASOS DE USO
│   ├── auth.py                     ← AuthService: Magic Link + JWT
│   ├── favorites.py                ← FavoriteService: Outbox + Broker + Regras de Negócio
│   ├── patterns.py                 ← PatternService: leitura do catálogo
│   └── messaging.py                ← MessageBroker: envelope padronizado (mock Redis)
│
├── repositories/                   ← INTERFACE ADAPTERS (persistência)
│   ├── favorite_repository.py      ← FavoriteRepository: count, get, add
│   └── pattern_repository.py       ← PatternRepository: get_all, get_by_id, get_collections
│
├── api/                            ← INTERFACE ADAPTERS (HTTP)
│   ├── dependencies.py             ← get_current_user: decodifica JWT e injeta User
│   └── routes/
│       ├── auth.py                 ← POST /v1/auth/magic-link e /verify
│       ├── favorites.py            ← POST /v1/favorites/{pattern_id}
│       └── patterns.py             ← GET /v1/patterns, /{id}, /v1/collections
│
├── workers/
│   └── favorite_worker.py          ← Worker async: consome fila, idempotência, DLQ
│
└── tests/
    ├── conftest.py                 ← Fixture AsyncClient para testes de integração
    └── test_main.py                ← Smoke test: GET / → HTTP 200
```

---

## Slide 11 — Decisões de Design e Trade-offs

### Decisão 1: Magic Link em vez de senha

**Motivo**: O público-alvo são bordadeiras, frequentemente com 50+ anos. Eliminar senha reduz a fricção no cadastro e aumenta a taxa de adoção do "Baú Pessoal". Não há gestão de credenciais para implementar ou para poderem esquecer.

**Trade-off**: Depende do cliente de e-mail da usuária e da latência de entrega. Em desenvolvimento, o link é simulado e impresso diretamente no log do servidor, eliminando essa dependência.

---

### Decisão 2: Mock do Message Broker

**Motivo**: Simplificar o ambiente de desenvolvimento local, sem precisar subir Redis ou RabbitMQ no Docker Compose.

**Garantia de continuidade**: o envelope JSON com `correlation_id`, `timestamp` e `topic` é rigorosamente idêntico ao que seria enviado em produção. A migração para Redis é **puramente de infraestrutura** — apenas o `__init__` do `MessageBroker` muda. Nenhum service ou worker precisa ser alterado.

---

### Decisão 3: Duas linhas de defesa para o limite de 100 favoritos

- **Service em Python**: primeira verificação antes de qualquer write — resposta rápida com mensagem de erro amigável para o frontend
- **Trigger no banco**: garantia absoluta e atômica que não pode ser contornada nem mesmo por um bug na camada de aplicação

---

### Decisão 4: asyncpg + AsyncSession

**Motivo**: o modelo I/O assíncrono permite que o servidor atenda múltiplas requisições enquanto aguarda resposta do banco, sem bloquear threads do sistema operacional. Essencial quando há workers rodando em background e múltiplas conexões simultâneas.

---

### Decisão 5: HTTP 202 Accepted para favoritar

**Motivo**: a operação de favoritar pode envolver geração de assets para modo offline e sincronização. Retornar `202 Accepted` imediatamente com um `correlation_id` permite que o frontend exiba feedback instantâneo e faça polling assíncrono do status — sem manter a conexão HTTP aberta até o fim do processamento.

---

## Slide 12 — Conclusão: Conformidade com Clean Architecture

O backend do Fio & Luz demonstra Clean Architecture através de decisões concretas e verificáveis diretamente no código:

**1. Dependências apontam para dentro**
`domain/models.py` não importa FastAPI, SQLAlchemy ou qualquer framework externo. `services/` importa `domain/` mas nunca importa `api/`. `api/` depende de `services/` e `domain/`, nunca ao contrário. A regra é estrutural e aplicada por convenção de pastas.

**2. Domínio isolado e independente**
As entidades de negócio (`User`, `Pattern`, `UserPattern`) e seus invariantes (`difficulty_level ge=1 le=5`, limite de 100 favoritos) existem independentemente do protocolo HTTP, do banco de dados e do framework. Podem ser testados unitariamente sem nenhum container.

**3. Casos de uso nomeados e rastreáveis**
Cada método de service é um caso de uso com nome explícito e única responsabilidade: `get_or_create_user`, `verify_magic_link`, `create_access_token`, `add_favorite`, `get_all_patterns`.

**4. Inversão de dependência operacional**
`Depends()` do FastAPI realiza injeção de dependência sem container IoC externo, mantendo o código testável — a `AsyncSession` e o `User` autenticado chegam prontos para qualquer rota que os declare.

**5. Interface Adapters como tradutores**
As rotas apenas traduzem `HTTP → service call → HTTP response`. Os repositórios apenas traduzem `SQL result → Python objects`. Nenhum detalhe de protocolo vaza para dentro das camadas de negócio.

**6. Infraestrutura substituível sem impacto no domínio**
O banco pode mudar de PostgreSQL para outro desde que implemente a mesma interface de `AsyncSession`. O broker pode mudar de mock para Redis sem tocar em nenhum service ou worker, pois o contrato do envelope já está estabilizado.
