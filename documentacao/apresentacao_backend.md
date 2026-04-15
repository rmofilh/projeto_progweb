# Roteiro de Apresentação — Backend Fio & Luz
### 10 minutos · formato "show me the code"

---

## Antes de começar

Deixe aberto no editor:
- Painel lateral com a árvore de arquivos do `backend/`
- Terminal pronto para rodar `pytest`

---

## ⏱ Parada 1 — Estrutura de pastas `(~1 min)`

**Mostre:** a árvore de arquivos do `backend/` no editor.

**Fale:**

> "A estrutura de pastas **é** a arquitetura. Cada diretório corresponde a uma camada da Clean Architecture. A regra fundamental é que as dependências só apontam para dentro: `api/` conhece `services/`, `services/` conhece `domain/`, mas `domain/` não conhece ninguém. Qualquer coisa dentro de `domain/` pode ser testada sem banco, sem HTTP, sem Docker."

---

## ⏱ Parada 2 — Domínio: `domain/models.py` e `domain/schemas.py` `(~2 min)`

**Mostre:** abra `domain/models.py`.

**Aponte:** a declaração da classe `UserPattern` e o campo `status = "PROCESSING"`.

**Fale:**

> "Aqui fica o coração do sistema — as entidades de negócio. `SQLModel` faz duas coisas ao mesmo tempo: define a tabela no PostgreSQL **e** valida os dados com Pydantic. O campo `status` em `UserPattern` é uma máquina de estados: nasce como `PROCESSING` e o worker assíncrono muda para `DONE` depois. O `difficulty_level` com `ge=1, le=5` é um invariante de domínio — o objeto simplesmente não existe se o valor for inválido."

**Mostre:** abra `domain/schemas.py`.

**Aponte:** `AuthRequest` com `EmailStr` e a hierarquia `PatternBase → PatternResponse`.

**Fale:**

> "Os schemas são os contratos da API — separados dos models porque representam coisas diferentes: o model é o banco, o schema é o que trafega na rede. `EmailStr` faz o FastAPI rejeitar e-mails inválidos com HTTP 422 automaticamente, antes de qualquer código meu rodar. A herança `PatternBase → PatternResponse` evita repetição e garante consistência de campos."

---

## ⏱ Parada 3 — Infraestrutura: `core/database.py` `(~1 min)`

**Mostre:** abra `core/database.py`.

**Aponte:** a `DATABASE_URL` com `postgresql+asyncpg` e a função `check_user_favorites_limit`.

**Fale:**

> "O prefixo `asyncpg` no URL de conexão é o que habilita I/O assíncrono com o banco — o servidor não trava uma thread esperando resposta do PostgreSQL. Mais importante: toda vez que a aplicação sobe, ela instala um trigger SQL diretamente no banco. Esse trigger é a **segunda linha de defesa** para a regra de negócio de 100 favoritos — independente da aplicação. Mesmo que um bug no serviço tente inserir o 101°, o banco rejeita."

---

## ⏱ Parada 4 — Casos de Uso: `services/` `(~2 min)`

**Mostre:** abra `services/auth.py`.

**Aponte:** o `__init__` recebendo `session` como parâmetro.

**Fale:**

> "O serviço recebe a sessão de banco de fora — ele **não cria** conexão. Quem controla o ciclo de vida da sessão é a camada acima. Isso é inversão de dependência na prática. O método `get_or_create_user` é idempotente: chamar com o mesmo e-mail duas vezes sempre retorna o mesmo usuário, nunca duplica. Isso elimina a necessidade de endpoints separados de cadastro e login."

**Mostre:** abra `services/favorites.py`.

**Aponte:** as quatro etapas em sequência no método `add_favorite`.

**Fale:**

> "Aqui estão as regras de negócio: primeiro checa o limite de 100, depois checa se já foi favoritado antes — idempotência. Se passou nas duas checagens, persiste com status `PROCESSING` **antes** de publicar no broker. Isso é o Outbox Pattern: se o broker falhar, o dado já está salvo no banco. Se o commit falhar, o evento nunca chega ao broker. Os dois lados sempre ficam consistentes."

---

## ⏱ Parada 5 — Injeção de Dependência: `api/dependencies.py` + rota `(~2 min)`

**Mostre:** abra `api/dependencies.py`.

**Aponte:** a assinatura de `get_current_user` com dois `Depends()`.

**Fale:**

> "Esse arquivo é onde a inversão de dependência se torna concreta. O FastAPI resolve a cadeia automaticamente: executa `get_session()`, passa a sessão para `get_current_user()`, que decodifica o JWT, busca o usuário no banco e entrega o objeto pronto para a rota. A rota não sabe que existe JWT. O service não sabe que existe HTTP."

**Mostre:** abra `api/routes/favorites.py`.

**Aponte:** a assinatura da função com `Depends(get_current_user)` e o `status_code=202`.

**Fale:**

> "A rota é propositalmente fina — não tem lógica. Gera o `correlation_id` na fronteira HTTP e delega tudo ao service. O retorno é `HTTP 202 Accepted` — 'recebi, estou processando' — não `200`. O cliente recebe o `correlation_id` para rastrear o status depois. Isso libera a conexão HTTP imediatamente enquanto o processamento pesado acontece em paralelo."

---

## ⏱ Parada 6 — Worker e Observabilidade: `workers/` + `services/messaging.py` `(~1 min)`

**Mostre:** abra `workers/favorite_worker.py`.

**Aponte:** o `if user_pattern.status == "DONE": return` e o bloco `except` com rollback.

**Fale:**

> "O worker roda como processo separado com sessão própria. Antes de fazer qualquer trabalho, relê o estado no banco — se o status já é `DONE`, ignora silenciosamente. Isso garante idempotência: se o evento chegar duplicado por retry, o trabalho nunca é feito duas vezes. Em caso de falha, o rollback desfaz qualquer escrita parcial e o envelope vai para a Dead Letter Queue — nenhum dado é perdido."

**Mostre:** abra `services/messaging.py` brevemente.

**Aponte:** o campo `correlation_id` dentro do envelope.

**Fale:**

> "O broker hoje é um mock que imprime no log, mas o contrato do envelope — com `correlation_id`, timestamp e topic — é idêntico ao que iria para Redis em produção. Trocar de mock para Redis é uma linha de código no `__init__`. Nenhum service ou worker muda."

---

## ⏱ Parada 7 — Testes: `tests/` `(~1 min)`

**Mostre:** abra `tests/conftest.py` e `tests/test_main.py`.

**Fale:**

> "`conftest.py` configura um `AsyncClient` do `httpx` apontando para a aplicação em memória — sem servidor rodando, sem Docker, sem banco real. É mais rápido e elimina dependências externas nos testes. O `@pytest.mark.asyncio` sinaliza ao `pytest-asyncio` que a função é assíncrona. O teste em `test_main.py` é um smoke test: valida que a aplicação inicializa, o lifespan roda e a rota raiz responde. É a primeira proteção contra regressão."

**Execute no terminal:**
```bash
pytest tests/ -v
```

**Mostre o resultado passando e encerre:**

> "Clean Architecture significa que cada camada tem uma razão única para mudar. Se o banco muda, só o repositório muda. Se o broker muda, só o `MessageBroker` muda. Se a regra de negócio muda, só o service muda. O domínio nunca muda por causa de infraestrutura."

---

## Resumo do Tempo

| Parada | Conteúdo | Tempo |
|--------|----------|-------|
| 1 | Estrutura de pastas — mapa da arquitetura | ~1 min |
| 2 | `domain/` — entidades, invariantes, schemas | ~2 min |
| 3 | `core/database.py` — asyncpg, trigger SQL | ~1 min |
| 4 | `services/` — casos de uso, Outbox, idempotência | ~2 min |
| 5 | `api/dependencies.py` + rota — Depends(), HTTP 202 | ~2 min |
| 6 | `workers/` + broker — DLQ, correlation_id | ~1 min |
| 7 | `tests/` — AsyncClient, smoke test, rodar pytest | ~1 min |
| **Total** | | **~10 min** |
