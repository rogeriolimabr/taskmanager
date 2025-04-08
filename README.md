# Task Manager

## Descrição

Este é um sistema de gerenciamento de tarefas com autenticação.
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

### Como Rodar a Aplicação

1. Clone o repositório:

   ```sh
   git clone https://github.com/rogeriolimabr/taskmanager.git
   cd taskmanager
   ```

2. Construa e inicie os containers Docker:

   ```sh
   docker compose up --build
   ```

3. Acesse a aplicação:
   - A API backend estará disponível em `http://localhost:8000`.
   - O Frontend estará disponível em `http://localhost:3000`.

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

A documentação da API será gerada automaticamente pelo FastAPI e estará disponível em `http://localhost:8000/documentation` (Redocly) ou `http://localhost:8000/swagger` (Swagger).

## Testes

1. Configure as variáveis de ambiente;

2. Construa e inicie os containers:

   ```sh
      docker compose up --build
   ```

3. Execute os testes utilizando o PyTest:

   ```sh
      cd backend
      pytest app/tests/test_main.py 
   ```

## Deployment

Este documento apresenta um passo a passo para implantar nossa aplicação containerizada na AWS.

### Pré-requisitos para Deployment

- Conta na AWS com permissões adequadas
- AWS CLI instalado e configurado
- Docker e Docker Compose instalados localmente

#### Etapa 1: Preparar imagens Docker

Primeiro, vamos construir e enviar nossas imagens para o ECR (Elastic Container Registry):

```bash
# Criar repositórios no ECR
aws ecr create-repository --repository-name backend
aws ecr create-repository --repository-name frontend

# Login no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com

# Construir as imagens
docker-compose build

# Taguear imagens para o ECR
aws_account_id=$(aws sts get-caller-identity --query Account --output text)
docker tag backend:latest $aws_account_id.dkr.ecr.us-east-1.amazonaws.com/backend:latest
docker tag frontend:latest $aws_account_id.dkr.ecr.us-east-1.amazonaws.com/frontend:latest

# Enviar imagens para o ECR
docker push $aws_account_id.dkr.ecr.us-east-1.amazonaws.com/backend:latest
docker push $aws_account_id.dkr.ecr.us-east-1.amazonaws.com/frontend:latest
```

#### Etapa 2: Configurar o banco de dados

```bash
# Criar instância RDS PostgreSQL
aws rds create-db-instance \
    --db-instance-identifier app-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --allocated-storage 20 \
    --master-username $POSTGRES_USER \
    --master-user-password $POSTGRES_PASSWORD \
    --db-name $POSTGRES_DB \
    --publicly-accessible \
    --backup-retention-period 7

# Obter endpoint do banco de dados
db_endpoint=$(aws rds describe-db-instances --db-instance-identifier app-db --query 'DBInstances[0].Endpoint.Address' --output text)
```

#### Etapa 3: Criar a infraestrutura ECS

```bash
# Criar cluster ECS
aws ecs create-cluster --cluster-name app-cluster

# Criar VPC e configurações de rede (opcional se já existir)
vpc_id=$(aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text)
subnet_ids=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpc_id" --query 'Subnets[0:2].SubnetId' --output text)

# Criar security group
security_group_id=$(aws ec2 create-security-group \
    --group-name app-sg \
    --description "Security group for app" \
    --vpc-id $vpc_id \
    --query 'GroupId' --output text)

# Configurar regras de segurança
aws ec2 authorize-security-group-ingress --group-id $security_group_id --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $security_group_id --protocol tcp --port 8000 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $security_group_id --protocol tcp --port 5432 --source-group $security_group_id
```

#### Etapa 4: Criar definições de tarefas

Crie um arquivo `backend-task.json`:

```json
{
    "family": "backend",
    "networkMode": "awsvpc",
    "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "backend",
            "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/backend:latest",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 8000,
                    "hostPort": 8000
                }
            ],
            "environment": [
                {"name": "POSTGRES_USER", "value": "POSTGRES_USER"},
                {"name": "POSTGRES_PASSWORD", "value": "POSTGRES_PASSWORD"},
                {"name": "POSTGRES_DB", "value": "POSTGRES_DB"},
                {"name": "POSTGRES_HOST", "value": "DB_ENDPOINT"}
            ]
        }
    ],
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512"
}
```

Crie um arquivo `frontend-task.json`:

```json
{
    "family": "frontend",
    "networkMode": "awsvpc",
    "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
    "containerDefinitions": [
        {
            "name": "frontend",
            "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/frontend:latest",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 3000,
                    "hostPort": 80
                }
            ],
            "environment": [
                {"name": "BACKEND_URL", "value": "http://BACKEND_ALB_DNS:8000"}
            ]
        }
    ],
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512"
}
```

Registre as definições de tarefas:

```bash
# Substitua ACCOUNT_ID, DB_ENDPOINT nos arquivos task.json
account_id=$(aws sts get-caller-identity --query Account --output text)
sed -i "s/ACCOUNT_ID/$account_id/g" backend-task.json frontend-task.json
sed -i "s/DB_ENDPOINT/$db_endpoint/g" backend-task.json

# Registrar definições de tarefas
aws ecs register-task-definition --cli-input-json file://backend-task.json
aws ecs register-task-definition --cli-input-json file://frontend-task.json
```

#### Etapa 5: Configurar Load Balancers

```bash
# Criar ALB para backend
backend_alb_arn=$(aws elbv2 create-load-balancer \
    --name backend-alb \
    --subnets $subnet_ids \
    --security-groups $security_group_id \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text)

# Criar target group para backend
backend_tg_arn=$(aws elbv2 create-target-group \
    --name backend-tg \
    --protocol HTTP \
    --port 8000 \
    --vpc-id $vpc_id \
    --target-type ip \
    --health-check-path /health \
    --query 'TargetGroups[0].TargetGroupArn' --output text)

# Criar listener para backend
aws elbv2 create-listener \
    --load-balancer-arn $backend_alb_arn \
    --protocol HTTP \
    --port 8000 \
    --default-actions Type=forward,TargetGroupArn=$backend_tg_arn

# Obter DNS do backend ALB
backend_alb_dns=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $backend_alb_arn \
    --query 'LoadBalancers[0].DNSName' --output text)

# Criar ALB para frontend
frontend_alb_arn=$(aws elbv2 create-load-balancer \
    --name frontend-alb \
    --subnets $subnet_ids \
    --security-groups $security_group_id \
    --query 'LoadBalancers[0].LoadBalancerArn' --output text)

# Criar target group para frontend
frontend_tg_arn=$(aws elbv2 create-target-group \
    --name frontend-tg \
    --protocol HTTP \
    --port 80 \
    --vpc-id $vpc_id \
    --target-type ip \
    --health-check-path / \
    --query 'TargetGroups[0].TargetGroupArn' --output text)

# Criar listener para frontend
aws elbv2 create-listener \
    --load-balancer-arn $frontend_alb_arn \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$frontend_tg_arn

# Atualizar a task definition do frontend com o endpoint do backend
sed -i "s/BACKEND_ALB_DNS/$backend_alb_dns/g" frontend-task.json
aws ecs register-task-definition --cli-input-json file://frontend-task.json
```

#### Etapa 6: Criar serviços ECS

```bash
# Criar role para execução de tarefas (se não existir)
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Criar serviço backend
aws ecs create-service \
    --cluster app-cluster \
    --service-name backend-service \
    --task-definition backend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$subnet_ids],securityGroups=[$security_group_id],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$backend_tg_arn,containerName=backend,containerPort=8000"

# Criar serviço frontend
aws ecs create-service \
    --cluster app-cluster \
    --service-name frontend-service \
    --task-definition frontend \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$subnet_ids],securityGroups=[$security_group_id],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=$frontend_tg_arn,containerName=frontend,containerPort=80"
```

#### Etapa 7: Acessar a aplicação

Após alguns minutos, a aplicação estará disponível:

- Frontend: http://[frontend-alb-dns]
- API Backend: http://[backend-alb-dns]:8000

#### Limpar recursos (quando não mais necessários)

```bash
# Deletar serviços ECS
aws ecs delete-service --cluster app-cluster --service backend-service --force
aws ecs delete-service --cluster app-cluster --service frontend-service --force

# Deletar Load Balancers
aws elbv2 delete-load-balancer --load-balancer-arn $backend_alb_arn
aws elbv2 delete-load-balancer --load-balancer-arn $frontend_alb_arn

# Deletar Target Groups
aws elbv2 delete-target-group --target-group-arn $backend_tg_arn
aws elbv2 delete-target-group --target-group-arn $frontend_tg_arn

# Deletar instância RDS
aws rds delete-db-instance --db-instance-identifier app-db --skip-final-snapshot

# Deletar repositórios ECR
aws ecr delete-repository --repository-name backend --force
aws ecr delete-repository --repository-name frontend --force

# Deletar cluster ECS
aws ecs delete-cluster --cluster app-cluster
```

### Observações

- Modifique as regiões AWS conforme necessário (o exemplo usa us-east-1)
- Ajuste os tipos de instância e configurações para suas necessidades específicas
- Considere usar o AWS Secrets Manager para credenciais sensíveis em produção
- Para ambientes de produção, configure HTTPS com certificados SSL

## Licença

[MIT](LICENSE)
