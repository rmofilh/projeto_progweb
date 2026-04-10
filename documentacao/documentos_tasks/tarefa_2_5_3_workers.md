# Registro de Implementação: Passo 2.5.3 - Workers Assíncronos (Idempotência e DLQ)

## Contexto
Dando continuação a arquitetura EDA do projeto **Fio & Luz**, preparamos a estrutura de consumo off-thread, garantindo escalabilidade real.

## O Que Foi Feito

1. **Arquitetura de Daemons Isolados (`workers/favorite_worker.py`):**
   - Construída a estrutura base de um processo Worker em Python visando não apenas extrair mensagens via Polling ou Subscribe de Redis/RabbitMQ, mas sim tratá-las de forma segura em background.
2. **Garantia de Idempotência:**
   - Adicionado mecanismo de checagem contra corrida no Banco de Dados (`select ... where... status`). O worker sempre confirma se determinado `user_pattern` já se encontra como `DONE` antes de aplicar processamento demorado. Extinguindo riscos de duplicação.
3. **Mecanismo de Seguros (DLQ - Dead Letter Queue):**
   - Definida instrução em bloco `try..except` cobrindo o bloco principal de simulação de peso.
   - Em caso de falha irreversível de processamento do Worker, a mensagem (incluindo o header/correlation_id) é empurrada via `lpush` para lista reservada `dlq_favorites` em Redis. Isso salva a rastreabilidade do erro sem derrubar o loop secundário.

**Autor:** Automação Assistente
**Task Referenciada:** `[x] 2.5.3` do pipeline `openspec/changes/fio-e-luz/tasks.md`.
