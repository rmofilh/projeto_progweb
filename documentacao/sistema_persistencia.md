# Documentação Técnica: Camada de Persistência e Integridade (Fio & Luz)

## 1. Visão Geral
A arquitetura de dados do sistema foi reforçada para suportar escalabilidade e garantir regras de negócio críticas. Introduzimos o **Padrão Repository** para isolar as consultas SQL e **Triggers de Banco de Dados** para assegurar a integridade do "Baú Pessoal".

## 2. Camada de Repositório (`backend/repositories/`)

O acesso ao banco de dados agora é intermediado por classes especializadas, promovendo o desacoplamento e facilitando testes unitários:

-   **`PatternRepository`**: Gerencia a recuperação de moldes e coleções. Abstrai a lógica de filtragem e busca por ID.
-   **`FavoriteRepository`**: Responsável por todas as operações relacionadas ao Baú Pessoal, incluindo contagem de favoritos por usuário e persistência do estado "Outbox".

## 3. Integridade de Negócio: Limite de 100 Favoritos

Para garantir a sustentabilidade do sistema e cumprir o requisito técnico de no máximo 100 favoritos por usuária, implementamos uma estratégia de defesa em duas camadas:

### Camada 1: Validação de Serviço (Application Level)
O `FavoriteService` consulta o repositório antes de cada inserção. Se o contador atingir 100, a operação é interrompida com uma mensagem de erro clara: *"Limite de 100 favoritos atingido no seu Baú Pessoal"*.

### Camada 2: Constraint de Banco (PostgreSQL Level)
Implementamos um Trigger de banco de dados (`trg_limit_user_favorites`) na tabela `user_patterns`. Este trigger atua em todas as inserções (`BEFORE INSERT`), garantindo que a regra seja respeitada mesmo em caso de inserções via script ou falhas na lógica de aplicação.

**Definição do Trigger:**
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

## 4. Refatoração de Serviços
Os serviços `PatternService` e `FavoriteService` foram refatorados para não interagir diretamente com a `AsyncSession` do SQLAlchemy. Eles agora recebem uma instância de repositório, focando estritamente na regência do fluxo de dados e emissão de eventos.

---
*Documento gerado automaticamente após a conclusão da Fase 3 da implementação.*
