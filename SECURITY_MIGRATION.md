# Ativação da branch security-hardening

Esta branch protege a API do Google Apps Script sem alterar a estrutura atual dos dados na planilha.

## Antes de publicar

1. Faça uma cópia de segurança da planilha.
2. No Apps Script vinculado à planilha, substitua o Code.gs pelo arquivo desta branch.
3. Em **Implantar > Gerenciar implantações**, edite a implantação existente, escolha **Nova versão** e publique.
4. Mantenha **Executar como: você** e **Quem pode acessar: qualquer pessoa**. A nova API exige sessão própria para todas as operações.
5. Confirme que a URL da implantação continua igual à constante API_BASE_URL do index.html.
6. Entre no aplicativo com uma conta já existente.

## Segurança obrigatória após a ativação

A credencial administrativa padrão já esteve publicada no histórico do repositório. Entre como administrador e troque imediatamente a senha de todas as contas conhecidas ou compartilhadas.

Se a aba `usuarios` estiver realmente vazia, execute manualmente a função `configurarAdministradorInicial` no editor do Apps Script. Ela se recusa a executar quando já existem contas.

## Publicação de teste

Publique primeiro a branch em um Preview Deployment da Vercel. Verifique:

- login de Administrador e Técnico;
- leitura dos cadastros;
- criação e edição de um registro;
- bloqueio do módulo Usuários para Técnico;
- conflito ao editar o mesmo módulo em duas abas;
- logout e expiração da sessão.

Depois dos testes, abra um pull request da branch `security-hardening` para `main`.

## Mudanças desta fase

- autenticação validada no Apps Script;
- sessões temporárias de seis horas;
- limitação de tentativas de login;
- bloqueio de leitura e gravação sem sessão;
- autorização administrativa para usuários;
- lista permitida de módulos;
- limite de tamanho e validação JSON;
- trava de gravação e detecção de concorrência;
- remoção da criação automática do administrador no navegador;
- falhas de gravação não são mais exibidas como sucesso.
