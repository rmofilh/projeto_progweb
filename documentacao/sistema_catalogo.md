# Documentação Técnica: Sistema de Catálogo e Descoberta (Fio & Luz)

## 1. Visão Geral
O sistema de Catálogo é responsável por servir os ativos digitais (Riscos/Patterns) e as Coleções Temáticas que organizam o conteúdo para a usuária final. Ele garante o acesso eficiente aos metadados necessários para a ativação da Mesa de Luz.

## 2. Estrutura de Rotas (API)

Os endpoints do catálogo não exigem autenticação (são públicos) para facilitar a descoberta inicial:

### Listagem de Riscos
- **Endpoint:** `GET /v1/patterns`
- **Query Params:** `collection_id` (opcional) - Filtra riscos por uma coleção específica.
- **Resposta:** Lista de objetos `PatternResponse`.

### Detalhe de Risco
- **Endpoint:** `GET /v1/patterns/{id}`
- **Resposta:** Objeto único `PatternResponse`. Contém o `scale_cm_reference`, vital para o cálculo de escala física real no frontend.

### Listagem de Coleções
- **Endpoint:** `GET /v1/collections`
- **Resposta:** Lista de objetos `CollectionResponse` (Título e Imagem de Capa).

## 3. Implementação Técnica

### Serviço de Domínio (`services/patterns.py`)
O `PatternService` centraliza as consultas ao banco de dados utilizando `SQLModel` de forma assíncrona. Ele abstrai a complexidade das queries de junção e filtragem.

### Contratos de Dados (`domain/schemas.py`)
- **`PatternResponse`**: Inclui campos como `difficulty_level` (1-5) e caminhos para `image_path` (SVG/PNG) e `thumbnail_path`.
- **`CollectionResponse`**: Define a estrutura mínima para exibição de cards de categorias.

## 4. Integração com o Frontend
O frontend consome estes endpoints para montar a página de "Descoberta Rápida". Os metadados de imagem (`thumbnail_path`) são usados pelo Service Worker para pré-cacheamento, permitindo que a lista de riscos seja visualizada mesmo sem conexão imediata com a internet.

---
*Documento gerado automaticamente após a conclusão da Fase 2 da implementação.*
