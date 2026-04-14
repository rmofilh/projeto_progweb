# Proposta: Alinhamento e Robustez do Backend (Fio & Luz)

## 1. Motivação
A implementação atual do backend do projeto **Fio & Luz** encontra-se em estado de "esqueleto" (skeleton). Embora os modelos de dados estejam corretos, faltam as camadas vitais de autenticação, catalogação e integração real com sistemas de mensageria assíncrona. Esta proposta visa preencher as lacunas técnicas identificadas nos relatórios de auditoria, movendo o sistema de um mock funcional para uma base produtiva sólida.

## 2. Objetivos
- **Autenticação Inclusiva:** Implementar o fluxo de Magic Link para o público 50+, simulando o envio de e-mail via logs para esta fase de desenvolvimento.
- **Catálogo Funcional:** Criar endpoints para listagem e detalhamento de riscos (`Patterns`), permitindo a funcionalidade de "Descoberta Rápida".
- **Refatoração Clean Architecture:** Isolar a lógica de banco de dados na camada de `Repositories`.
- **Integridade de Negócio:** Adicionar restrições de banco de dados para limitar o Baú Pessoal a 100 favoritos por usuária.
- **Mensageria Real:** Substituir o broker de mensagens por uma integração real com Redis, preparando o terreno para processamentos pesados de imagem.

## 3. Benefícios
- **Segurança:** Protege o acesso aos favoritos das usuárias via JWT.
- **Performance:** Desacopla o processamento de favoritos da resposta da API.
- **Manutenibilidade:** Melhora o isolamento de componentes através do padrão Repository.
- **Escalabilidade:** Prepara o backend para rodar em containers orquestrados com serviços reais de infraestrutura.

## 4. Riscos e Mitigações
| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| **Complexidade da Migração para Redis** | Média | Utilizar o `docker-compose.yml` para garantir que o serviço de Redis esteja sempre disponível para a API. |
| **Erros de Integridade no Postgres** | Baixa | Implementar migrações seguras via `SQLModel` para adicionar as constraints de limite de favoritos. |
| **Falsa Sensação de Conclusão** | Média | Seguir rigorosamente o plano de testes automatizados para validar cada novo endpoint. |
