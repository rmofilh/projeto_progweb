# Prompt para Gerador de Slides — Backend Fio & Luz (Gabarito Completo)

---

Crie uma apresentação profissional de slides para defesa acadêmica de um backend Python chamado **Fio & Luz**. A apresentação tem **10 minutos** e segue o formato **"show me the code"**. Use um visual técnico e moderno: fundo escuro (#0d1117), destaque de sintaxe Python (Monokai ou similar), tipografia clara (Sans-serif).

---

## ESTRUTURA DE SLIDES (10 MINUTOS)

### SLIDE 1 — Título & Contexto
**Título:** Backend Fio & Luz: Arquitetura Event-Driven e Clean Arch
**Subtítulo:** FastAPI · SQLModel · TDD · Docker
**Tópicos rápidos:**
- PWA para Bordadeiras (Mesa de Luz digital)
- Autenticação sem senha (Magic Link)
- Baú Pessoal (Favoritos com Auditoria)

---

### SLIDE 2 — O Mapa: Clean Architecture `(~1 min)`
**Título:** Estrutura de Pastas = Arquitetura de Camadas
**Visual:** Arvore de diretórios com labels coloridos:
- `domain/` → **Camada 1: Entities** (O Coração. Invariantes de negócio)
- `services/` → **Camada 2: Use Cases** (Orquestração e lógica de app)
- `repositories/` & `api/` → **Camada 3: Interface Adapters** (SQL e HTTP)
- `core/` & `workers/` → **Camada 4: Frameworks & Drivers** (Infra e Async)

**Frase de impacto:** "As dependências lógicas apontam para dentro. Decidimos por uma Clean Arch Pragmática usando SQLModel para evitar redundância."


---

### SLIDE 3 — O Domínio: Regras Reais `(~1 min)`
**Título:** `domain/models.py` — Validação no nível do objeto
**Código:**
```python
class Pattern(SQLModel, table=True):
    difficulty_level: int = Field(ge=1, le=5) # Invariante de negócio
    scale_cm_reference: float                  # Integridade física

class UserPattern(SQLModel, table=True):
    status: str = Field(default="PROCESSING") # Máquina de estados
```
**Explicação:** "Embora o SQLModel (ORM) esteja no domínio, ele serve como o Core do objeto. A lógica de negócio é isolada, e o desacoplamento real acontece nos Repositórios."


---

### SLIDE 4 — Inversão de Dependência: Especificação de Infra `(~1.5 min)`
**Título:** Desacoplando Infraestrutura com `Depends()`
**Código:**
```python
# api/dependencies.py
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    session: AsyncSession = Depends(get_session) # Sessão injetada
):
    # Lógica de decodificação JWT e busca no Postgres
```
**Conceito:** "Invertemos o controle. A rota não sabe 'como' conectar ao banco, ela apenas recebe a sessão pronta via Injeção de Dependência."

---

### SLIDE 5 — Use Cases: O Padrão Outbox `(~1.5 min)`
**Título:** `services/favorites.py` — Resiliência no Favoritar
**Código (simplificado):**
```python
async def add_favorite(self, user_id, pattern_id):
    # 1. Regra de Negócio: Limite de 100
    # 2. Persistência: Banco com status PROCESSING (Outbox)
    # 3. Notificação: Publica evento para o Broker
```
**Nota:** "A regra de 100 favoritos é validada no Service, mas também temos um **Trigger PL/pgSQL** no banco como segunda linha de defesa."

---

### SLIDE 6 — API & Swagger: O Contrato Vivo `(~1 min)`
**Título:** Documentação Automática (Briefing Swagger/OpenAPI)
**Visual:** Mockup da interface `/docs` do FastAPI.
**Destaque:**
- **Versionamento:** `/v1/favorites/`
- **Segurança:** Botão "Authorize" integrado com JWT
- **Schemas:** Contract-First (O código define a Documentação)
**Fale:** "O Swagger não é apenas uma lista, é o contrato vivo que garante que Frontend e Backend falam a mesma língua."

---

### SLIDE 7 — TDD & Docker: Evidência de Qualidade `(~2 min)`
**Título:** Testes no Docker — Cobertura e Confiabilidade
**Terminal Visual:**
```bash
docker compose exec api pytest --cov=.
```
**Resultado Real:** `TOTAL: 86%` (Supera o requisito de 80%).
**Código (conftest.py):**
```python
# Fixture do AsyncClient: Testes E2E sem precisar subir o servidor real
@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac: yield ac
```
**Onde falha? (Transparência Técnica):**
- "Gaps de cobertura em caminhos de exceção raros (infra-failure) e mocks de broker que não simulam durabilidade de hardware."

---

### SLIDE 8 — Linha do Tempo: O Caminho do Usuário `(~1 min)`
**Título:** User Journey: Do Clique ao Background
**Diagrama:**
1. `POST /favorites` → 2. JWT Validated (`api/dep`) → 3. Add to DB (`PROCESSING`) → 4. Event Dispatched → 5. Response 202 Accepted.
**Background:** 6. Worker consumes → 7. Simulate Assets Generation → 8. Update DB to `DONE`.

---

### SLIDE 9 — Conclusão
**Título:** Resumo de Conformidade
- **Clean Arch Pragmática:** Separação de interesses com foco em produtividade (DRY).
- **DDD:** Domínio rico e auto-validável.
- **SOLID:** Inversão de dependência em todas as rotas.
- **Qualidade:** 86% de cobertura em ambiente isolado (Docker).


**Frase Final:** "Código limpo não é preferência, é requisito para manutenção."

---

## INSTRUÇÕES ADICIONAIS
- Use **Syntax Highlight** real (não texto colorido estático).
- Slides de código devem ocupar 80% da tela.
- Use **Emojis técnicos** moderadamente (🐳 para Docker, 🐍 para Python, 🏗️ para Arch).
