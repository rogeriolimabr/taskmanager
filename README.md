# Task Manager

## Descrição

Este é um sistema de gerenciamento de tarefas com autenticação/autorização.
A aplicação consiste em dois componentes principais:

- Backend (FastAPI) - APIs RESTful para autenticação, autorização e gerenciamento de tareafas.
- Frontend (Reactjs + ShadcnUI) - Dashboard para exibir e realizar a interação das tasks, com drag n drop para movimentação dos status das tarefas.

## Infraestrutura

A aplicação será colocada em containers, segregado por três serviços:

- Banco de Dados (PostgreSQL)
- Backend (FastAPI)
- Frontend (Reactjs)

## Funcionalidades

- Autenticação de usuários utilizando JWT.
- Gerenciamento de tarefas:
  - Criação, edição, exclusão e visualização de tarefas.
- Endpoints da API para registro, login e gerenciamento de tasks.

## Estrutura do Projeto

```plaintext
task_manager/
|-- backend/
|   |-- app/
|   |   |-- __init__.py
|   |   |-- main.py
|   |-- Dockerfile
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- Dockerfile
|   |-- package.json
|-- docker-compose.yml
|-- README.md
```

## Instruções para Execução

### Pré-requisitos

- Docker
- Docker Compose

### Como Rodar a Aplicação

1. Clone o repositório:

   ```sh
   git clone https://github.com/rogeriolimabr/taskmanager.git
   cd taskmanager
   ```

2. Construa e inicie os containers Docker:

   ```sh
   docker-compose up --build
   ```

3. Acesse a aplicação:
   - A aplicação estará disponível em `http://localhost:80`.

## Endpoints da API

### Autenticação

- `POST /api/register`: Registro de um novo usuário.
- `POST /api/login`: Login do usuário (retorno do token JWT).

### Gerenciamento de Tarefas

- `GET /api/tasks`: Lista todas as task do usuário autenticado.
- `POST /api/tasks`: Criação de uma nova task.
- `PUT /api/tasks/{id}`: Atualização de uma task existente.
- `DELETE /api/tasks/{id}`: Exclusão de uma task.
- `GET /api/tasks/{id}`: Visualização de uma task específica.

## Documentação da API

A documentação da API será gerada automaticamente pelo FastAPI e estará disponível em `http://localhost:8000/swagger`.

## Testes

Instruções sobre como rodar os testes serão adicionadas em breve.

## Deployment

Instruções sobre como fazer o deploy da aplicação em um servidor (como Heroku, AWS ou DigitalOcean) serão adicionadas em breve.

## Licença

[MIT](LICENSE)
