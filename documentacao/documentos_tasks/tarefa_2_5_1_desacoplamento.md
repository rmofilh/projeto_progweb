# Registro de Implementação: Passo 2.5.1 - Desacoplamento e Camadas (MVC/Domain)

## Contexto
Durante o modo de exploração (`/opsx-explore`) do projeto **Fio & Luz**, a arquitetura síncrona monolítica encontrada do MVP no diretório base `backend/` foi diagnosticada como um gargalo futuro para estresse de rede, inviabilizando processamentos corretos de retentativas.

Decidimos modularizar a arquitetura e prepará-la para Event-Driven Architecture (EDA) e Mensageria. A primeira fase disso é isolar responsabilidades para que a posterior emissão de mensagens ocorra em um terreno desacoplado, limpo e seguro.

## O Que Foi Feito

1. **Reestruturação de Pastas (Domain-Driven):**
   - Criamos a árvore de diretórios arquitetural baseada em domínios:
     - `api/`: Centralizará as rotas (Controllers API) do app. O `main.py` serve de ponto de carga do Uvicorn ou roteadores, focado apenas em atender HTTP e enquadrar Status.
     - `domain/`: O núcleo de tipos. Acomodou os `models.py` (SQLModel/ORM Entities) e os `schemas.py` (Pydantic Contracts).
     - `core/`: Configurações centrais do sistema, como o driver do banco que agora acomoda `database.py`.
     - `services/`: Pastas e submódulos criados para ser a única camada com direito de possuir "Ifs/Thens" das regras de negócio e de onde posteriormente enviaremos as filas.
     - `repositories/`: Camada que fará o bypass para `database.py`, limitando contato estrito da API direta com as `Sessions`.

2. **Repontes de Importação Táticos:**
   - O `import database` no `main.py` foi portado para `from core.database ...`.
   - O `database.py` que importava `SQLModel` de models.py raiz passou a buscar de `from domain.models ...`.

3. **Invariante Mantida:**
   - Nenhuma linha de lógica de processamento foi readequada, mantendo o Frontend e os acessos via Web puros; preparamos apenas o tabuleiro do backend para o próximo check-in estrutural: a injeção do Broker (Passo 2). 

**Autor:** Automação Assistente
**Task Referenciada:** `[x] 2.5.1` do pipeline `openspec/changes/fio-e-luz/tasks.md`.
