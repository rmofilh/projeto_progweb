# Registro de Implementação: Passo 2.5.4 - Refinamento de Banco (Otimização I/O)

## Contexto
O ecossistema base do FastAPI exigia como refinamento final no "Fio & Luz" que a comunicação Web->Postgres ou Worker->Postgres não mantivesse nenhum fio conector como bloqueante (sync) no interpretador Python, suportando máxima concorrência.

## O Que Foi Feito

1. **Atualização Estrutural de Driver (`requirements.txt`):**
   - O adaptador bloqueante padrão `psycopg2-binary` foi erradicado do projeto.
   - Introduzimos o `asyncpg` oficial para comunicações via assíncronas do SQLAlchemy 2.0+ nativas.
2. **Transcrição de Database/Engine (`core/database.py`):**
   - Convertemos as engrenagens estritas `create_engine` e `Session` do SQLModel.
   - O arquivo passou a operar integralmente sob `create_async_engine(..., future=True)` e a entregar as injeções através de `AsyncSession` assíncronas puras baseadas na factory do SQLAlchemy Ext Asyncio.
   - O evento de start-up da API foi refatorado para utilizar `await conn.run_sync(...)`.
3. **Escorpo Purista Assíncrono:**
   - Os serviços criados nas tasks anteriores (Workers e Favoritos) foram escritos já herdando o design pattern assíncrono (valendo-se estritamente de `await session.commit()`, blindando qualquer interrupção na Event Loop do uvicorn). 

Este fechamento cimenta um backend digno de escalonamento elástico real e finaliza perfeitamente nossa Fase Arquitetural 2.5.

**Autor:** Automação Assistente
**Task Referenciada:** `[x] 2.5.4` do pipeline `openspec/changes/fio-e-luz/tasks.md`.
