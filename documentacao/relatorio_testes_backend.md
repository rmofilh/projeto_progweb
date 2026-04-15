# Relatório de Cobertura e Testes: Backend (Fio & Luz)

Este documento registra os testes realizados no backend para garantir a conformidade com os requisitos de escalabilidade, resiliência e arquitetura EDA (Event-Driven Architecture).

## Métricas de Qualidade

- **Cobertura de Código:** **86%** (Meta: >80%)
- **Suíte de Testes:** **12 Testes Aprovados**
- **Ambiente de Teste:** Docker (container `api`) com banco de dados isolado via `TRUNCATE` entre ciclos.

## Detalhamento das Coberturas

### 1. Sistema de Autenticação (`v1/auth`)
Testamos o fluxo completo de **Magic Links**, que é o pilar central da nossa segurança:
- **Solicitação:** Verificamos se o sistema cria usuários sob demanda e gera tokens únicos.
- **Validação:** Garantimos que tokens expirados ou inválidos retornam `401 Unauthorized`.
- **Sessão:** Verificamos a geração correta de JWT (JSON Web Tokens) compatíveis com o padrão exigido.

### 2. Catálogo e Coleções (`v1/patterns`)
Validamos a integridade da entrega dos dados:
- **Listagem Progressiva:** Testamos a listagem de moldes e coleções.
- **Filtros:** Garantimos que o filtro por `collection_id` funciona corretamente (essencial para a navegação no Frontend).
- **Tratamento de Erros:** Verificamos que IDs inexistentes retornam `404 Not Found`.

### 3. Favoritos e Baú Pessoal (EDA)
Este é o teste mais crítico devido à integração com a arquitetura de eventos:
- **Outbox Pattern:** Confirmamos que ao favoritar, o registro inicial é sempre gravado com status `PROCESSING`.
- **Idempotência:** Testamos e garantimos que o sistema não duplica favoritos se o usuário disparar a mesma ação múltiplas vezes.
- **Regras de Negócio (Limite 100):** Validamos que o sistema impede a adição de favoritos acima do limite definido de 100 itens no Baú Pessoal.

## Notas Técnicas e Resiliência

### Resolução de Concorrência (NullPool)
Durante o desenvolvimento dos testes, identificamos um gargalo de concorrência com o driver `asyncpg` no ambiente de testes (Erro: *another operation is in progress*). 
**Solução Aplicada:** Implementamos o `NullPool` no motor de banco de dados (`conftest.py`) exclusivamente para a suíte de testes. Isso garante que cada teste opere em uma conexão limpa, evitando colisões entre a API e as verificações do banco.

### Mocking vs Realidade
- **Broker:** O `MessageBroker` foi mockado para os testes unitários, garantindo que a publicação de mensagens (`publish`) seja chamada com o `correlation_id` correto sem exigir um Redis em execução apenas para os testes.
- **Email:** O envio de email é simulado via logs (Simulação de E-mail), permitindo validar o fluxo sem dependências externas de rede.

## Como Executar Novamente
Para auditar estes resultados a qualquer momento, execute:
```bash
docker compose exec api pytest --cov=. --cov-report=term-missing
```

---
**Data do Relatório:** 15 de Abril de 2026
**Status do Projeto:** ✅ Backend Validado e Protegido
