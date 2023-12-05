# Camunda Tools

Este projeto, denominado "Camunda Tools", consiste em uma extensão que oferece ferramentas estendidas para o cockpit da plataforma Camunda.

## Descrição

O objetivo desta extensão é facilitar a interação com processos na plataforma Camunda, proporcionando funcionalidades adicionais no cockpit.

## Funcionalidades

- **Move Process:**
  - Permite mover instâncias de processos de uma atividade para outra.
  - Fornece uma interface intuitiva para selecionar a instância do processo, a atividade de origem e a atividade de destino.

- **Delete Process:**
  - Possibilita a exclusão de processos, com a devida confirmação para evitar ações irreversíveis.

## Estrutura do Projeto

- `camunda-tools.css`: Arquivo de estilo para a interface do usuário.
- `images/`: Diretório contendo as imagens utilizadas na aplicação.
- `content.js`: Script JavaScript modular para fornecer funcionalidades.
- `camunda-tools.html`: Página HTML principal.
- `src/`: Diretório contendo scripts adicionais e recursos.

## Arquivos Principais

- **camunda-tools.css:** Define estilos para a interface do usuário da extensão.
- **camunda-tools.html:** Estrutura principal da interface do usuário.
- **content.js:** Fornece funcionalidades dinâmicas à página, manipulando o DOM.
- **inserted-style.css:** Contém estilos adicionais inseridos dinamicamente na página.
- **LICENSE.md:** Documentação da licença (ISC) sob a qual o projeto é distribuído.
- **manifest.json:** Configurações da extensão, incluindo permissões, scripts e ícones.
- **package.json e package-lock.json:** Gerenciamento de dependências do projeto.
- **README.md:** Documentação principal do projeto.
- **webpack.config.js e webpack.prod.js:** Configurações para o Webpack, responsável pelo empacotamento e otimização.

## Funcionalidades Principais

### Integração com a API Camunda

- **camundaApi.js:** Interage com a API da Camunda, permitindo modificações e movimentos em instâncias de processo.

### Notificações no Cockpit

- **cockpitInjections.js:** Cria notificações visuais no cockpit, exibindo mensagens de sucesso, erro, aviso ou informações.

### Armazenamento de Sessão

- **sessionApi.js:** Fornece funções para interagir com o armazenamento de sessão do Chrome, permitindo a leitura e gravação de dados na sessão da extensão.

### Utilitários

- **util.js:** Contém utilitários, incluindo uma função para extrair o identificador de instância de processo a partir de uma URL.

### Plano de Fundo da Extensão

- **background.js:** Script de plano de fundo que responde a mensagens e utiliza a função `setSessionStorage` para armazenar dados na sessão da extensão.




## Instalação

1. Clone este repositório.
```bash
git clone git@github.com:jontaspeixoto/camunda-tools.git
```

2. Abra o navegador Chrome e acesse `chrome://extensions/`.

3. Habilite o modo de desenvolvedor.

4. Clique em "Carregar sem compactação" e selecione o diretório do projeto.

5. A extensão "Camunda Tools" estará disponível no navegador.

## Como Usar

1. Abra o cockpit da Camunda.

2. Utilize as opções no menu principal para mover ou excluir processos.

3. Siga as instruções na interface para executar as ações desejadas.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir problemas (issues) e enviar pull requests.

## Licença

Este projeto é distribuído sob a licença [ISC](https://opensource.org/licenses/ISC). Consulte o arquivo `LICENSE` para obter mais detalhes.

## Contato

Para mais informações, entre em contato com o autor:
- Nome: Jonatas Peixoto
- GitHub: [jonataspeixoto](https://github.com/jonataspeixoto)
- Email: [jonatasmspeixoto@gmail.com](mailto:jonatasmspeixoto@gmail.com)
