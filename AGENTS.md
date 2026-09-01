# Diretrizes de Desenvolvimento — Meu SaaS Corporativo

Estas regras se aplicam a toda alteração feita neste repositório. Antes de iniciar uma demanda, verifique as convenções e componentes já existentes; mantenha o padrão visual, técnico e de segurança do projeto.

## Segurança, RBAC e auditoria

- Mantenha o modelo RBAC existente: usuários possuem perfis (`roles`) e perfis possuem permissões (`permissions`). Não crie verificações de acesso isoladas ou permissões fora desse fluxo.
- Toda autorização deve ser aplicada no **back-end** (policies, requests ou middleware). Ocultar um botão no front-end é apenas uma melhoria de interface, nunca a proteção principal.
- No front-end, use os mecanismos de autorização existentes (`can`, `hasRole`, `PermissionGuard` e mapeamento de rotas) para mostrar apenas ações e telas liberadas ao perfil atual.
- Novas permissões devem seguir o padrão `<módulo>.<ação>` — por exemplo, `clients.view`, `clients.create`, `clients.edit`, `clients.delete` e, quando aplicável, `clients.export`.
- Toda nova tela ou módulo deve ter suas permissões cadastradas no banco pelo fluxo de migrations/seeders já usado pelo projeto. Cadastre a rota no mapeamento de permissões, proteja a tela e faça com que ela apareça na gestão de perfis para liberação por usuário.
- Não conceda permissões novas automaticamente a perfis não administrativos sem uma decisão explícita. O perfil `admin` mantém o acesso total conforme a regra atual.
- Registre no `ActivityLog` as ações relevantes: criação, edição, exclusão, alteração de status, exportação, mudanças de perfis/permissões e demais operações sensíveis. Inclua usuário executor, módulo, ação, descrição, IP, user agent e detalhes úteis.
- Não registre senhas, tokens, documentos sigilosos ou outros dados sensíveis nos logs.

## Validação obrigatória de segurança

- Antes de concluir qualquer demanda, valide a segurança da funcionalidade criada ou alterada.
- Confirme que todas as rotas e ações sensíveis exigem autenticação e autorização RBAC também no back-end; teste mentalmente requisições diretas que ignorem a interface.
- Valide e normalize todas as entradas no servidor. Nunca confie em valores, permissões, IDs, filtros, arquivos ou campos enviados pelo front-end.
- Verifique se o usuário só consegue consultar, alterar, excluir ou exportar dados dentro do escopo permitido pelo seu perfil e pela regra de negócio.
- Proteja dados sensíveis: não exponha senhas, hashes, tokens, segredos, dados pessoais desnecessários ou detalhes internos em respostas da API, erros, logs ou interface.
- Use consultas parametrizadas/ORM, listas permitidas para ordenação e filtros, e evite construir comandos ou consultas a partir de entrada do usuário.
- Para uploads, valide tipo, tamanho e conteúdo do arquivo; armazene arquivos com nomes seguros e nunca execute conteúdo enviado pelo usuário.
- Revise operações destrutivas, alterações de privilégio, redefinição de senha, exportações e configurações para garantir confirmação, autorização e auditoria adequadas.
- Ao alterar autenticação, sessões ou permissões, valide cenários de acesso negado, escalonamento de privilégio e uso de contas desativadas.
- Execute as verificações e testes de segurança proporcionais ao risco e reporte claramente qualquer risco, limitação ou ponto que exija decisão do responsável.

## Telas, experiência e responsividade

- Preserve o layout, componentes do design system, tipografia, cores, espaçamentos, tema claro/escuro e comportamento de navegação já estabelecidos.
- Todas as telas devem ser responsivas e utilizáveis em celular, tablet e desktop.
- Uma tela protegida deve mostrar apenas o que o usuário pode acessar; caso ele abra uma rota sem permissão, utilize a tela/componente de acesso negado existente.
- Trate estados de carregamento, vazio, erro e sucesso. Use toasts e mensagens de validação claras em português.
- Mantenha acessibilidade básica: rótulos em campos, contraste, foco visível, botões com propósito claro e ações destrutivas com confirmação.

## Funcionalidades de gestão

- Para novos módulos de gestão, entregue o ciclo completo conforme aplicável: criar, listar, visualizar, atualizar, excluir e exportar.
- Cada ação deve ter sua própria permissão quando o RBAC do módulo exigir granularidade.
- Exclusões precisam de confirmação; prefira exclusão lógica quando esse for o padrão ou a necessidade do domínio.
- Valide os dados no back-end e no front-end. O back-end é a fonte definitiva da validação e das regras de negócio.

## Listagens e tabelas

- Tabelas devem ter busca, ordenação, paginação e seletor de quantidade de linhas.
- O padrão inicial de linhas por página é **5**. Valores adicionais devem seguir os componentes e convenções existentes.
- A busca, filtros, ordenação e paginação devem ser aplicados no back-end para dados persistidos, com colunas de ordenação explicitamente permitidas.
- Exporte somente os dados aos quais o usuário possui acesso, respeitando filtros e escopo de autorização.

## Qualidade e entrega

- Reaproveite serviços, requests, resources, policies e componentes existentes antes de criar duplicações.
- Em alterações de banco, inclua migrations reversíveis e atualize seeders quando necessário.
- Não quebre contratos da API; mantenha respostas, validações e mensagens consistentes com o padrão atual.
- Após implementar, execute as verificações apropriadas (lint/typecheck, sintaxe, testes e build quando cabível) e informe qualquer limitação encontrada.
- Preserve alterações não relacionadas já presentes no repositório.
