# Tarefas de Implementação: Fio & Luz

## 1. Setup do Projeto e Infraestrutura

- [ ] 1.1 Configurar ambiente Backend com FastAPI e Pydantic
- [ ] 1.2 Configurar ambiente Frontend com Next.js (App Router) e TypeScript
- [ ] 1.3 Configurar banco de dados PostgreSQL com SQLModel/SQLAlchemy
- [ ] 1.4 Criar Dockerfile multi-stage para Backend e Frontend
- [ ] 1.5 Configurar validações de linting e tipos em ambos os projetos

## 2. Modelo de Dados e API (Backend)

- [ ] 2.1 Implementar Entidade `Risco` e Migrações (tabela `patterns`)
- [ ] 2.2 Implementar Entidade `Coleção` e Migrações (tabela `collections`)
- [ ] 2.3 Implementar endpoints de listagem e detalhe de moldes (`/v1/patterns`)
- [ ] 2.4 Implementar sistema de Magic Link para autenticação via e-mail
- [ ] 2.5 Implementar endpoints do Baú Pessoal (favoritos) e persistência

## 3. Interface e Experiência do Usuário (Frontend)

- [ ] 3.1 Implementar Design System básico (Cores Alabaster/Charcoal e Fontes Lora/Outfit)
- [ ] 3.2 Criar página de Catálogo principal com grid responsivo e busca
- [ ] 3.3 Implementar Onboarding guiado (perguntas visuais) para novas usuárias
- [ ] 3.4 Criar visualização de Detalhes do Risco com metadados de cm/bastidor
- [ ] 3.5 Implementar fluxo de Favoritos com sincronização local/servidor

## 4. Mesa de Luz Móvel (Core Feature)

- [ ] 4.1 Implementar lógica de ativação da Screen Wake Lock API
- [ ] 4.2 Criar Overlay de isolamento de toque (captura de eventos Pointer/Touch)
- [ ] 4.3 Implementar lógica de calibração de escala física (`devicePixelRatio`)
- [ ] 4.4 Criar interface de Mesa de Luz (Preto puro sobre Branco brilhante, Fullscreen)
- [ ] 4.5 Implementar saída segura via toque longo (gesto intencional)

## 5. Resiliência e PWA

- [ ] 5.1 Configurar Manifesto PWA e Service Worker básico
- [ ] 5.2 Implementar Cache Storage para assets estáticos e shell da aplicação
- [ ] 5.3 Implementar offline-first para o Baú Pessoal (carregamento HD via SW)
- [ ] 5.4 Implementar Fallback para Wake Lock (NoSleep.js + Modal Instrucional)
- [ ] 5.5 Configurar IndexedDB para persistência de metadados offline

## 6. Verificação e Qualidade

- [ ] 6.1 Implementar testes unitários para a lógica de escala física
- [ ] 6.2 Criar testes de integração para os endpoints críticos da API
- [ ] 6.3 Validar acessibilidade (WCAG AAA) em fluxos principais
- [ ] 6.4 Realizar teste de fumaça da PWA em dispositivos Android e iOS
