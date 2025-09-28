# COMMENTS

API REST para gerenciar comentários em _posts_.

## Como rodar a aplicação

Inicialmente, você precisa ter um banco de dados _PostgreSQL_ configurado. Ele pode ser local (via _Docker_) ou remoto. É essencial ajustar o arquivo _.env_ com as seguintes variáveis de ambiente para a conexão:

* DB_HOST
* DB_PORT
* DB_USER
* DB_PASSWORD
* DB_DATABASE
  
Para provisionar o banco de dados via _Docker_, utilize o _script_ definido no [package.json](package.json) com o comando:
```curl
npm run services:up
```
Após o banco estar pronto, popule-o com os **usuários padrão** necessários para realizar login e interagir com a aplicação. Para isso, execute o comando:
```curl
npm run db:seed
```
* Usuários Padrão: O processo de seeding cria os seguintes usuários para testes manuais:

  >User 1: virk@adonisjs.com / Senha: secret
  
  >User 2: romain@adonisjs.com / Senha: supersecret

Com o banco de dados inicializado e populado, inicie a aplicação em modo de desenvolvimento com o comando:
```curl
npm run start:dev
```

## Como testar

### Testes Automatizados com _Docker_

Deixamos um _script_ pronto no [package.json](package.json) para facilitar a execução dos testes. Ele provisiona o banco de dados, garante sua inicialização e aplica as _migrations_ necessárias antes de rodar a suíte de testes.

Execute o comando:
```curl
npm run test
```

### Testes Manuais com [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

Para realizar testes manuais, você pode utilizar os arquivos de requisição disponíveis na pasta [http/](./http). Certifique-se de que a aplicação está rodando (seguindo as instruções em [Como Rodar a Aplicação](#como-rodar)) e utilize o plugin REST Client do VS Code para executá-los.

## Decisões técnicas

### Testes Funcionais vs. Testes Unitários

Nesta fase inicial do projeto, priorizamos a cobertura de **Testes Funcionais** (ou de integração). Entendemos que eles são suficientes para garantir a qualidade, pois testam os **fluxos completos** da aplicação e validam o comportamento da interação com o banco de dados.

A complexidade atual do projeto é baixa e as classes não possuem dependências ou lógica interna que justifiquem o esforço adicional de criar e manter uma suíte abrangente de **Testes Unitários**. Optar pelos testes funcionais nos permite ter uma visão completa e robusta do sistema com um esforço de desenvolvimento significativamente menor.

### Aninhamento de Respostas (_Reply Nesting_)

Para suportar o **aninhamento de respostas infinitas** (infinite _nesting_) de forma eficiente, a _API REST_ foi projetada com o princípio de **descoberta (_discoverability_)**.

  > **Consulta Inicial**: O _endpoint_ principal de comentários retorna apenas os **comentários de nível superior** (que não são respostas) e o **primeiro nível de aninhamento** (respostas diretas a esses comentários).
  
  > **Descoberta Progressiva**: Para acessar níveis de aninhamento mais profundos, criamos um _endpoint_ dedicado. O cliente faz uma nova chamada para buscar as respostas de um comentário específico, permitindo que o usuário explore a profundidade da conversa sob demanda a cada iteração.

Essa estratégia não só evita a transferência de grandes volumes de dados de uma só vez, como também **possibilita uma paginação eficiente** em cada nível de aninhamento. Isso **reduz a carga e otimiza o desempenho no banco de dados** ao evitar consultas recursivas ou complexas para carregar toda a árvore de comentários simultaneamente.

### Execução de _Soft Delete_ em Comentários e Respostas

A funcionalidade de exclusão foi implementada como um **"_soft delete_"** (exclusão lógica), onde um flag (`deleted = true`) é aplicado ao invés de remover os dados fisicamente.

Devido ao potencial de **aninhamento infinito** e à complexidade de gerenciar a cascata de exclusão em código de aplicação, optamos por transferir essa responsabilidade para o banco de dados. Utilizamos um comando _SQL_ bruto com **_CTE_ (_Common Table Expression_) Recursiva para**:

  > Identificar, de forma performática, todos os comentários filhos e descendentes de um comentário pai.

  > Aplicar o flag de exclusão em todos os nós da sub-árvore com uma única operação no banco.

Essa abordagem garante que a exclusão em cascata seja rápida e eficiente, minimizando o tráfego de dados e a carga de processamento na aplicação. Reconhecemos que a utilização de _SQL_ bruto para essa tarefa é uma escolha inicial e que a solução pode ser revista no futuro em função do crescimento ou de mudanças na arquitetura do banco de dados.
