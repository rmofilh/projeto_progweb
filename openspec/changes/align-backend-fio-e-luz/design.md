# Design: Alinhamento e Robustez do Backend

## 1. Arquitetura de Autenticação (Magic Link)

O sistema de login será baseado em tokens de uso único (OTP) enviados via "e-mail" (simulado em logs).

### Fluxo:
1.  `POST /v1/auth/magic-link`: Recebe o e-mail, gera um token UUID e o salva no banco associado ao usuário. O link `https://fioeluz.app/verify?token=...` é emitido no log do servidor.
2.  `POST /v1/auth/verify`: Recebe o token, valida no banco, expira o token e retorna um **JWT** (JSON Web Token) contendo o `user_id`.

## 2. Camada de Persistência (Padrão Repository)

Para isolar o SQLModel dos serviços, implementaremos classes de repositório no diretório `backend/repositories/`.

-   **`PatternRepository`**: Listagem filtrada, busca por ID e contagem.
-   **`FavoriteRepository`**: Gestão da relação N:N, incluindo a checagem da constraint de quantidade.

## 3. Integridade do Banco de Dados (Constraints)

Será adicionada uma regra no PostgreSQL para garantir que o limite de 100 favoritos seja respeitado, funcionando como uma última linha de defesa.

-   **Implementação:** Uma `CHECK` constraint ou uma função trigger que valida `count(*)` na tabela `user_patterns` para o `user_id` atual antes de cada `INSERT`.

## 4. Integração com Broker (Mock Conservado)

O `MessageBroker` em `services/messaging.py` continuará operando em modo mock para simplificar o desenvolvimento local.

-   **Comportamento**: As mensagens serão emitidas via `print()` no log do servidor.
-   **Estrutura**: Deve-se manter rigorosamente o envelope JSON e o `correlation_id` para garantir que a transição para Redis no futuro seja puramente de infraestrutura.

## 5. Novos Contratos de Dados (Schemas)

### `AuthRequest`:
```python
class AuthRequest(BaseModel):
    email: EmailStr
```

### `TokenResponse`:
```python
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

### `CollectionResponse`:
```python
class CollectionResponse(BaseModel):
    id: UUID
    title: str
    cover_image_path: str
```
