# Tarefas: Alinhamento do Backend (Fio & Luz)

## Fase 1: Autenticação e Segurança (Prioridade Alta)
- [x] 1.1 Criar schemas de `AuthRequest` e `TokenResponse` em `domain/schemas.py`.
- [x] 1.2 Implementar o serviço `AuthService` para gerar e validar tokens de Magic Link.
- [x] 1.3 Criar a rota `POST /v1/auth/magic-link` com log de simulação de e-mail.
- [x] 1.4 Criar a rota `POST /v1/auth/verify` que emite o JWT.
- [x] 1.5 Implementar middleware ou dependência `get_current_user` para proteger rotas.

## Fase 2: Catálogo de Riscos (Descoberta Rápida)
- [x] 2.1 Criar schemas de `CollectionResponse` e expandir `PatternResponse`.
- [x] 2.2 Implementar `PatternService` para listagem de coleções e riscos.
- [x] 2.3 Criar rotas `GET /v1/patterns` e `GET /v1/patterns/{id}`.
- [x] 2.4 Criar rota `GET /v1/collections` para o catálogo temático.

## Fase 3: Camada Repository e Integridade
- [x] 3.1 Criar `backend/repositories/pattern_repository.py`.
- [x] 3.2 Criar `backend/repositories/favorite_repository.py`.
- [x] 3.3 Refatorar `FavoriteService` para utilizar os repositórios.
- [x] 3.4 Implementar a constraint de banco de dados (100 favoritos) via migração ou comando manual SQLModel.

## Fase 4: Mensageria e Ambiente (EDA)
- [x] 4.1 Refinar o `MessageBroker` mock para garantir o uso do `correlation_id`.
- [x] 4.2 Validar o fluxo de logs do processamento assíncrono fictício.
