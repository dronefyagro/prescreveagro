# Histórico de versões

## v1.5.0 — 2026-08-23

### Incluído

- nova aba Consulta Técnica para apoio ao manejo integrado de pragas;
- base importada da planilha MIP.xlsx com 219 registros químicos e 9 agentes biológicos;
- pesquisa por produto, ingrediente ativo, agente biológico, empresa e alvo;
- filtros por tipo de controle e alvo ou uso principal;
- exibição de formulação, registrante e classificações toxicológica e ambiental dos produtos químicos;
- exibição de categoria, grupo-alvo e uso principal dos agentes biológicos;
- aviso para conferência de registro, bula, cultura, dose e restrições oficiais antes da recomendação.

## v1.4.0 — 2026-08-22

### Incluído

- seleção múltipla de pragas e doenças-alvo diretamente no Receituário;
- opções carregadas do banco editável da aba Pragas e Doenças;
- agrupamento visual entre pragas e doenças, com nome comum e científico;
- gravação dos vínculos por identificador e exibição dos alvos no receituário;
- compatibilidade com receituários antigos que possuam alvo em texto livre.

## v1.3.0 — 2026-08-22

### Incluído

- comparação do catálogo com o Manual de Identificação de Pragas da Cana e a planilha Pragas Regionais;
- oito novos registros ausentes: broca do Nordeste, broca-peluda, cigarrinha-das-folhas, curculionídeo-rajado, broca-gigante, lagartas desfolhadoras, nematoides e podridão-vermelha;
- migração automática que adiciona somente registros faltantes, preservando edições existentes;
- catálogo ampliado para 21 pragas e doenças da cana-de-açúcar.

## v1.2.0 — 2026-08-22

### Incluído

- nova aba editável de Pragas e Doenças;
- campos de classificação, nome comum, nome científico, ciclo de vida e cultura agrícola;
- base inicial com 13 pragas e doenças relevantes da cana-de-açúcar;
- possibilidade de criar, editar e excluir registros do catálogo.

## v1.1.0 — 2026-08-22

### Incluído

- cadastro de talhões individuais ou em grupos;
- vários códigos de talhão em um único lançamento;
- área total conjunta do grupo;
- identificação do grupo nas listas e nos receituários;
- compatibilidade com talhões cadastrados nas versões anteriores.

## v1.0.0 — 2026-08-22

Primeira versão formal do Prescreve Agro.

### Incluído

- cadastros de clientes, fazendas, talhões, produtos e responsáveis técnicos;
- emissão de receituários agronômicos;
- diretrizes operacionais;
- perfis Administrador e Técnico;
- autenticação validada pelo Google Apps Script;
- sessões temporárias e limitação de tentativas de login;
- proteção de leitura e gravação da API;
- controle de acesso ao módulo de usuários;
- detecção de alterações simultâneas;
- identificação da versão no rodapé da plataforma.

## Regra de versionamento

- **Correção**: incrementa o último número — exemplo: v1.0.1.
- **Nova funcionalidade compatível**: incrementa o número central — exemplo: v1.1.0.
- **Mudança estrutural incompatível**: incrementa o primeiro número — exemplo: v2.0.0.
