# 🔥 DevRoast - Especificação de Implementação do Drizzle ORM

> **Especificação técnica para implementação do banco de dados PostgreSQL com Drizzle ORM**

Baseado na análise do layout do DevRoast (usando MCP Pencil) e nas funcionalidades definidas no README.md, esta especificação define a estrutura do banco de dados necessária para suportar o sistema de código review com IA.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades Identificadas](#funcionalidades-identificadas)
- [Esquema do Banco de Dados](#esquema-do-banco-de-dados)
- [Enums](#enums)
- [Configuração Docker Compose](#configuração-docker-compose)
- [Implementação do Drizzle ORM](#implementação-do-drizzle-orm)
- [Checklist de Implementação](#checklist-de-implementação)

## 🎯 Visão Geral

O DevRoast é uma aplicação de code review que permite usuários submeterem código para análise por IA, recebendo uma pontuação de vergonha (1-10) e feedback detalhado. O sistema mantém um ranking global e histórico de submissões.

### Tecnologias
- **ORM**: Drizzle ORM
- **Banco**: PostgreSQL
- **Container**: Docker Compose
- **Framework**: Next.js 15+

## 🎮 Funcionalidades Identificadas

Com base na análise das telas do layout Pencil:

1. **Tela 1 - Code Input**: Submissão de código
2. **Tela 2 - Roast Results**: Exibição de resultados da análise
3. **Tela 3 - Shame Leaderboard**: Ranking global de submissões
4. **Componentes**: Sistema de pontuação, feedback, navegação

### Funcionalidades Core
- ✅ Submissão de código para análise IA
- ✅ Geração de pontuação de vergonha (1-10)
- ✅ Feedback/roasting detalhado da IA
- ✅ Ranking/leaderboard global
- ✅ Histórico de submissões por usuário

## 🗃️ Esquema do Banco de Dados

### 1. Tabela `users`
Informações básicas dos usuários (anonymous/session-based)

```sql
-- Usuários do sistema (baseado em sessão para simplicidade inicial)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100), -- opcional, para leaderboard
  email VARCHAR(255), -- opcional
  avatar_url TEXT, -- opcional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Tabela `code_submissions`
Submissões de código para análise

```sql
-- Submissões de código
CREATE TABLE code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Código original
  original_code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  
  -- Configurações da análise
  roast_mode roast_mode_enum NOT NULL DEFAULT 'honest',
  
  -- Resultados da análise IA
  shame_score INTEGER CHECK (shame_score >= 1 AND shame_score <= 10),
  ai_feedback TEXT, -- Feedback detalhado da IA
  ai_roast TEXT, -- Versão "roast" do feedback
  
  -- Metadados
  analysis_duration_ms INTEGER, -- Tempo de processamento
  status submission_status_enum DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  analyzed_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_code_submissions_user_id ON code_submissions(user_id);
CREATE INDEX idx_code_submissions_shame_score ON code_submissions(shame_score);
CREATE INDEX idx_code_submissions_language ON code_submissions(language);
CREATE INDEX idx_code_submissions_created_at ON code_submissions(created_at);
CREATE INDEX idx_code_submissions_status ON code_submissions(status);
```

### 3. Tabela `code_improvements`
Sugestões de melhoria no código (diff/patches)

```sql
-- Sugestões de melhoria no código
CREATE TABLE code_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES code_submissions(id) ON DELETE CASCADE,
  
  -- Dados da melhoria
  title VARCHAR(255) NOT NULL,
  description TEXT,
  improved_code TEXT NOT NULL,
  diff_patch TEXT, -- Git-style diff
  
  -- Classificação da melhoria
  improvement_type improvement_type_enum NOT NULL,
  priority priority_level_enum DEFAULT 'medium',
  
  -- Metadados
  line_start INTEGER,
  line_end INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_code_improvements_submission_id ON code_improvements(submission_id);
CREATE INDEX idx_code_improvements_type ON code_improvements(improvement_type);
```

### 4. Tabela `leaderboard_entries`
Entradas do ranking global (cache/view materializada)

```sql
-- Cache do leaderboard para performance
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES code_submissions(id) ON DELETE CASCADE,
  
  -- Dados do ranking
  shame_score INTEGER NOT NULL,
  language VARCHAR(50) NOT NULL,
  code_preview TEXT, -- Primeiras linhas do código
  
  -- Metadados de ranking
  rank_position INTEGER,
  total_submissions INTEGER DEFAULT 1,
  average_score DECIMAL(3,2),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para leaderboard
CREATE INDEX idx_leaderboard_shame_score ON leaderboard_entries(shame_score DESC);
CREATE INDEX idx_leaderboard_language ON leaderboard_entries(language);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(rank_position);
CREATE UNIQUE INDEX idx_leaderboard_user_submission ON leaderboard_entries(user_id, submission_id);
```

### 5. Tabela `analysis_sessions`
Sessões de análise IA (para debugging e métricas)

```sql
-- Sessões de análise IA
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES code_submissions(id) ON DELETE CASCADE,
  
  -- Dados da sessão IA
  ai_model VARCHAR(100), -- GPT-4, Claude, etc.
  prompt_template TEXT,
  ai_response_raw TEXT, -- Response completa da IA
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  
  -- Performance
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_analysis_sessions_submission_id ON analysis_sessions(submission_id);
CREATE INDEX idx_analysis_sessions_ai_model ON analysis_sessions(ai_model);
CREATE INDEX idx_analysis_sessions_success ON analysis_sessions(success);
```

## 📝 Enums

### Drizzle Schema Enums

```typescript
// src/db/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core';

// Modo de análise
export const roastModeEnum = pgEnum('roast_mode_enum', [
  'roast',    // Modo selvagem/brutal
  'honest',   // Modo construtivo/honesto
]);

// Status da submissão
export const submissionStatusEnum = pgEnum('submission_status_enum', [
  'pending',    // Aguardando análise
  'analyzing',  // Em análise
  'completed',  // Análise concluída
  'failed',     // Erro na análise
]);

// Tipos de melhoria
export const improvementTypeEnum = pgEnum('improvement_type_enum', [
  'performance',     // Melhoria de performance
  'readability',     // Legibilidade
  'security',        // Segurança
  'best_practices',  // Boas práticas
  'bug_fix',         // Correção de bugs
  'code_style',      // Estilo de código
  'architecture',    // Arquitetura
]);

// Níveis de prioridade
export const priorityLevelEnum = pgEnum('priority_level_enum', [
  'low',
  'medium', 
  'high',
  'critical',
]);
```

## 🐳 Configuração Docker Compose

### Estrutura de Arquivos

```
/
├── docker-compose.yml
├── docker-compose.override.yml (opcional)
├── .env
├── .env.example
└── docker/
    ├── postgres/
    │   ├── init-scripts/
    │   │   ├── 01-init-db.sql
    │   │   ├── 02-create-extensions.sql
    │   │   └── 03-seed-data.sql
    │   └── postgresql.conf (opcional)
    └── backup/
        └── scripts/
            ├── backup.sh
            └── restore.sh
```

### docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: devroast-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-devroast}
      POSTGRES_USER: ${DB_USER:-devroast_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devroast_password}
      POSTGRES_INITDB_ARGS: "--auth-host=scram-sha-256 --encoding=UTF8 --locale=en_US.utf8"
      # Performance tuning
      POSTGRES_SHARED_PRELOAD_LIBRARIES: "pg_stat_statements"
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      # Dados persistentes
      - postgres_data:/var/lib/postgresql/data
      # Scripts de inicialização
      - ./docker/postgres/init-scripts:/docker-entrypoint-initdb.d:ro
      # Configuração customizada (opcional)
      - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      # Backup directory
      - ./docker/backup:/backup
    command: 
      - "postgres"
      - "-c"
      - "config_file=/etc/postgresql/postgresql.conf"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-devroast_user} -d ${DB_NAME:-devroast}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - devroast-network

  # Redis para cache e sessões
  redis:
    image: redis:7-alpine
    container_name: devroast-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-devroast_redis}
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - devroast-network

  # Adminer para gerenciar banco (development only)
  adminer:
    image: adminer:latest
    container_name: devroast-adminer
    restart: unless-stopped
    ports:
      - "${ADMINER_PORT:-8080}:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres
      ADMINER_DESIGN: dracula
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - devroast-network
    profiles:
      - dev  # Só roda em dev: docker-compose --profile dev up

  # pgAdmin (alternativa ao Adminer)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: devroast-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@devroast.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "${PGADMIN_PORT:-8081}:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
      - ./docker/pgadmin/servers.json:/pgadmin4/servers.json:ro
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - devroast-network
    profiles:
      - dev

volumes:
  postgres_data:
    name: devroast_postgres_data
  redis_data:
    name: devroast_redis_data
  pgadmin_data:
    name: devroast_pgadmin_data

networks:
  devroast-network:
    name: devroast-network
    driver: bridge
```

### docker-compose.override.yml (Development)

```yaml
# docker-compose.override.yml
# Sobrescreve configurações para desenvolvimento
version: '3.8'

services:
  postgres:
    # Configurações de desenvolvimento
    environment:
      POSTGRES_LOG_STATEMENT: all
      POSTGRES_LOG_MIN_DURATION_STATEMENT: 0
    # Ports expostos para debug
    ports:
      - "5432:5432"
    
  redis:
    # Debug mode para Redis
    command: redis-server --appendonly yes --loglevel debug
    ports:
      - "6379:6379"
```

### Scripts de Inicialização PostgreSQL

#### docker/postgres/init-scripts/01-init-db.sql

```sql
-- 01-init-db.sql
-- Script de inicialização do banco DevRoast

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca por texto

-- Configurar timezone
SET timezone = 'UTC';

-- Criar schema se necessário
CREATE SCHEMA IF NOT EXISTS public;

-- Garantir que o usuário tem permissões
GRANT ALL PRIVILEGES ON DATABASE devroast TO devroast_user;
GRANT ALL ON SCHEMA public TO devroast_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO devroast_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO devroast_user;

-- Configurações de performance
ALTER DATABASE devroast SET shared_preload_libraries = 'pg_stat_statements';
ALTER DATABASE devroast SET log_statement = 'all';
ALTER DATABASE devroast SET log_min_duration_statement = 100;

-- Função para update automático de timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

COMMENT ON FUNCTION update_updated_at_column() IS 'Atualiza automaticamente a coluna updated_at';
```

#### docker/postgres/init-scripts/02-create-extensions.sql

```sql
-- 02-create-extensions.sql
-- Extensões PostgreSQL para DevRoast

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Statistics and monitoring
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- JSON operations
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Array operations
CREATE EXTENSION IF NOT EXISTS "intarray";

-- Cryptography (para hash de senhas se necessário)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verificar extensões instaladas
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE installed_version IS NOT NULL
ORDER BY name;
```

#### docker/postgres/init-scripts/03-seed-data.sql

```sql
-- 03-seed-data.sql
-- Dados iniciais para desenvolvimento

-- Inserir usuário de teste
INSERT INTO users (session_id, username, email) 
VALUES 
  ('dev-session-123', 'devuser', 'dev@devroast.com'),
  ('test-session-456', 'testuser', 'test@devroast.com')
ON CONFLICT (session_id) DO NOTHING;

-- Inserir submissões de exemplo para desenvolvimento
INSERT INTO code_submissions (
  user_id, 
  original_code, 
  language, 
  roast_mode, 
  shame_score, 
  ai_feedback,
  status
) 
SELECT 
  u.id,
  'function hello() { console.log("Hello World"); }',
  'javascript',
  'honest',
  5,
  'Código básico mas funcional. Considere usar const/let ao invés de var.',
  'completed'
FROM users u 
WHERE u.username = 'devuser'
ON CONFLICT DO NOTHING;

-- Criar views úteis para desenvolvimento
CREATE OR REPLACE VIEW v_leaderboard AS
SELECT 
  u.username,
  cs.shame_score,
  cs.language,
  LEFT(cs.original_code, 100) as code_preview,
  cs.created_at
FROM code_submissions cs
JOIN users u ON cs.user_id = u.id
WHERE cs.status = 'completed'
ORDER BY cs.shame_score ASC, cs.created_at DESC;

COMMENT ON VIEW v_leaderboard IS 'View para facilitar consultas do leaderboard';
```

### Configuração PostgreSQL Otimizada

#### docker/postgres/postgresql.conf

```conf
# postgresql.conf
# Configurações otimizadas para DevRoast

# Connections and Authentication
max_connections = 100
listen_addresses = '*'

# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Logging
log_destination = 'stderr'
logging_collector = on
log_statement = 'none'  # 'all' para debug
log_min_duration_statement = 1000  # log queries > 1s
log_line_prefix = '%t [%p-%l] %u@%d '

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200

# Locale
lc_messages = 'en_US.utf8'
lc_monetary = 'en_US.utf8'
lc_numeric = 'en_US.utf8'
lc_time = 'en_US.utf8'
default_text_search_config = 'pg_catalog.english'

# Extensions
shared_preload_libraries = 'pg_stat_statements'
```

### .env.example

```bash
# .env.example
# Copie para .env e ajuste as variáveis

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=devroast
DB_USER=devroast_user
DB_PASSWORD=devroast_password
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# SSL Mode para produção
DB_SSL_MODE=disable  # prefer, require, disable

# ===========================================
# REDIS CONFIGURATION
# ===========================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=devroast_redis
REDIS_URL="redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}"

# ===========================================
# DEVELOPMENT TOOLS
# ===========================================
# Adminer
ADMINER_PORT=8080

# pgAdmin
PGADMIN_EMAIL=admin@devroast.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=8081

# ===========================================
# IA APIs
# ===========================================
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Configurações IA
AI_MODEL_PRIMARY=gpt-4-turbo
AI_MODEL_FALLBACK=claude-3-sonnet
AI_MAX_TOKENS=2000
AI_TIMEOUT_MS=30000

# ===========================================
# APPLICATION
# ===========================================
NODE_ENV=development
PORT=3000
NEXTAUTH_SECRET=your_nextauth_secret_here_minimum_32_characters
NEXTAUTH_URL=http://localhost:3000

# Session configuration
SESSION_SECRET=your_session_secret_here
SESSION_MAX_AGE=86400  # 24 hours in seconds

# ===========================================
# MONITORING & LOGGING
# ===========================================
LOG_LEVEL=info  # error, warn, info, debug
ENABLE_QUERY_LOGGING=false
SENTRY_DSN=your_sentry_dsn_here

# ===========================================
# DOCKER COMPOSE PROFILES
# ===========================================
# Para rodar apenas serviços específicos
# docker-compose --profile dev up
# docker-compose --profile prod up
COMPOSE_PROFILES=dev
```

### Scripts de Backup e Restore

#### docker/backup/scripts/backup.sh

```bash
#!/bin/bash
# backup.sh - Script de backup do PostgreSQL

set -e

# Configurações
DB_CONTAINER="devroast-postgres"
DB_NAME="devroast"
DB_USER="devroast_user"
BACKUP_DIR="/backup"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/devroast_backup_${DATE}.sql"

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
echo "🔄 Iniciando backup do banco DevRoast..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE
echo "✅ Backup concluído: ${BACKUP_FILE}.gz"

# Limpar backups antigos (manter apenas os últimos 7 dias)
find $BACKUP_DIR -name "devroast_backup_*.sql.gz" -mtime +7 -delete
echo "🧹 Backups antigos removidos"

# Verificar tamanho do backup
SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
echo "📊 Tamanho do backup: $SIZE"
```

#### docker/backup/scripts/restore.sh

```bash
#!/bin/bash
# restore.sh - Script de restore do PostgreSQL

set -e

# Verificar se foi fornecido arquivo de backup
if [ -z "$1" ]; then
    echo "❌ Uso: $0 <arquivo_backup.sql.gz>"
    echo "💡 Exemplo: $0 /backup/devroast_backup_20240324_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
DB_CONTAINER="devroast-postgres"
DB_NAME="devroast"
DB_USER="devroast_user"

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

# Confirmar restore
echo "⚠️  ATENÇÃO: Esta operação irá sobrescrever o banco '$DB_NAME'"
echo "📁 Arquivo: $BACKUP_FILE"
read -p "🤔 Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

# Fazer restore
echo "🔄 Iniciando restore do banco..."

# Descomprimir se necessário
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Descomprimindo arquivo..."
    TEMP_FILE="/tmp/devroast_restore_$(date +%s).sql"
    gunzip -c $BACKUP_FILE > $TEMP_FILE
    RESTORE_FILE=$TEMP_FILE
else
    RESTORE_FILE=$BACKUP_FILE
fi

# Dropar e recriar banco
echo "🗑️  Recriando banco de dados..."
docker exec $DB_CONTAINER psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec $DB_CONTAINER psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

# Restaurar dados
echo "📥 Restaurando dados..."
docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < $RESTORE_FILE

# Limpar arquivo temporário
if [ ! -z "$TEMP_FILE" ]; then
    rm -f $TEMP_FILE
fi

echo "✅ Restore concluído com sucesso!"
```

### Scripts de Gerenciamento

#### Makefile

```makefile
# Makefile para DevRoast
.PHONY: help dev prod down clean backup restore logs

# Configurações
COMPOSE_FILE=docker-compose.yml
PROJECT_NAME=devroast

help: ## Mostrar esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

dev: ## Subir ambiente de desenvolvimento
	@echo "🚀 Subindo ambiente de desenvolvimento..."
	docker-compose --profile dev up -d
	@echo "✅ Ambiente pronto!"
	@echo "📊 Adminer: http://localhost:8080"
	@echo "🐘 pgAdmin: http://localhost:8081"
	@echo "🗄️  Postgres: localhost:5432"

prod: ## Subir ambiente de produção
	@echo "🚀 Subindo ambiente de produção..."
	docker-compose up -d postgres redis
	@echo "✅ Ambiente de produção pronto!"

down: ## Parar todos os serviços
	@echo "🛑 Parando serviços..."
	docker-compose --profile dev down

clean: ## Limpar volumes e containers
	@echo "⚠️  Esta operação irá remover TODOS os dados!"
	@read -p "Continuar? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose --profile dev down -v
	docker system prune -f

backup: ## Fazer backup do banco
	@echo "💾 Fazendo backup..."
	./docker/backup/scripts/backup.sh

restore: ## Restaurar backup (uso: make restore BACKUP_FILE=arquivo.sql.gz)
	@echo "📥 Restaurando backup..."
	./docker/backup/scripts/restore.sh $(BACKUP_FILE)

logs: ## Ver logs dos serviços
	docker-compose logs -f

logs-db: ## Ver logs apenas do PostgreSQL
	docker-compose logs -f postgres

db-shell: ## Acessar shell do PostgreSQL
	docker exec -it devroast-postgres psql -U devroast_user -d devroast

redis-cli: ## Acessar CLI do Redis
	docker exec -it devroast-redis redis-cli

status: ## Ver status dos serviços
	docker-compose ps

reset-db: ## Reset completo do banco (CUIDADO!)
	@echo "⚠️  Esta operação irá APAGAR todos os dados do banco!"
	@read -p "Continuar? (y/N): " confirm && [ "$$confirm" = "y" ]
	docker-compose stop postgres
	docker volume rm devroast_postgres_data || true
	docker-compose up -d postgres
	@echo "✅ Banco resetado!"
```

## ⚙️ Implementação do Drizzle ORM

### 1. Instalação de Dependências

```bash
# Instalar dependências
npm install drizzle-orm drizzle-kit pg
npm install -D @types/pg

# Para migrations
npm install dotenv
```

### 2. Configuração do Drizzle

```typescript
// src/db/config.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
```

### 3. Schema Principal

```typescript
// src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  check,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  roastModeEnum,
  submissionStatusEnum,
  improvementTypeEnum,
  priorityLevelEnum,
} from './enums';

// Tabela Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: varchar('session_id', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 100 }),
  email: varchar('email', { length: 255 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('idx_users_session_id').on(table.sessionId),
}));

// Tabela Code Submissions
export const codeSubmissions = pgTable('code_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Código
  originalCode: text('original_code').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  
  // Configurações
  roastMode: roastModeEnum('roast_mode').default('honest').notNull(),
  
  // Resultados IA
  shameScore: integer('shame_score'),
  aiFeedback: text('ai_feedback'),
  aiRoast: text('ai_roast'),
  
  // Metadados
  analysisDurationMs: integer('analysis_duration_ms'),
  status: submissionStatusEnum('status').default('pending').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  analyzedAt: timestamp('analyzed_at'),
}, (table) => ({
  userIdIdx: index('idx_code_submissions_user_id').on(table.userId),
  shameScoreIdx: index('idx_code_submissions_shame_score').on(table.shameScore),
  languageIdx: index('idx_code_submissions_language').on(table.language),
  createdAtIdx: index('idx_code_submissions_created_at').on(table.createdAt),
  statusIdx: index('idx_code_submissions_status').on(table.status),
  // Check constraint para shame score
  shameScoreCheck: check('shame_score_check', sql`shame_score >= 1 AND shame_score <= 10`),
}));

// Tabela Code Improvements
export const codeImprovements = pgTable('code_improvements', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').references(() => codeSubmissions.id, { onDelete: 'cascade' }).notNull(),
  
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  improvedCode: text('improved_code').notNull(),
  diffPatch: text('diff_patch'),
  
  improvementType: improvementTypeEnum('improvement_type').notNull(),
  priority: priorityLevelEnum('priority').default('medium').notNull(),
  
  lineStart: integer('line_start'),
  lineEnd: integer('line_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  submissionIdIdx: index('idx_code_improvements_submission_id').on(table.submissionId),
  typeIdx: index('idx_code_improvements_type').on(table.improvementType),
}));

// Tabela Leaderboard Entries
export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  submissionId: uuid('submission_id').references(() => codeSubmissions.id, { onDelete: 'cascade' }).notNull(),
  
  shameScore: integer('shame_score').notNull(),
  language: varchar('language', { length: 50 }).notNull(),
  codePreview: text('code_preview'),
  
  rankPosition: integer('rank_position'),
  totalSubmissions: integer('total_submissions').default(1).notNull(),
  averageScore: decimal('average_score', { precision: 3, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  shameScoreIdx: index('idx_leaderboard_shame_score').on(table.shameScore).desc(),
  languageIdx: index('idx_leaderboard_language').on(table.language),
  rankIdx: index('idx_leaderboard_rank').on(table.rankPosition),
  userSubmissionIdx: uniqueIndex('idx_leaderboard_user_submission').on(table.userId, table.submissionId),
}));

// Tabela Analysis Sessions
export const analysisSessions = pgTable('analysis_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').references(() => codeSubmissions.id, { onDelete: 'cascade' }).notNull(),
  
  aiModel: varchar('ai_model', { length: 100 }),
  promptTemplate: text('prompt_template'),
  aiResponseRaw: text('ai_response_raw'),
  tokensUsed: integer('tokens_used'),
  costUsd: decimal('cost_usd', { precision: 10, scale: 4 }),
  
  latencyMs: integer('latency_ms'),
  success: boolean('success').default(true).notNull(),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  submissionIdIdx: index('idx_analysis_sessions_submission_id').on(table.submissionId),
  aiModelIdx: index('idx_analysis_sessions_ai_model').on(table.aiModel),
  successIdx: index('idx_analysis_sessions_success').on(table.success),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(codeSubmissions),
  leaderboardEntries: many(leaderboardEntries),
}));

export const codeSubmissionsRelations = relations(codeSubmissions, ({ one, many }) => ({
  user: one(users, {
    fields: [codeSubmissions.userId],
    references: [users.id],
  }),
  improvements: many(codeImprovements),
  leaderboardEntry: one(leaderboardEntries),
  analysisSessions: many(analysisSessions),
}));

export const codeImprovementsRelations = relations(codeImprovements, ({ one }) => ({
  submission: one(codeSubmissions, {
    fields: [codeImprovements.submissionId],
    references: [codeSubmissions.id],
  }),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  user: one(users, {
    fields: [leaderboardEntries.userId],
    references: [users.id],
  }),
  submission: one(codeSubmissions, {
    fields: [leaderboardEntries.submissionId],
    references: [codeSubmissions.id],
  }),
}));

export const analysisSessionsRelations = relations(analysisSessions, ({ one }) => ({
  submission: one(codeSubmissions, {
    fields: [analysisSessions.submissionId],
    references: [codeSubmissions.id],
  }),
}));
```

### 4. Configuração do Drizzle Kit

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### 5. Scripts Package.json

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/db/seed.ts",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:reset": "docker-compose down -v && docker-compose up -d"
  }
}
```

## ✅ Checklist de Implementação

### Fase 1: Configuração Base
- [ ] Configurar Docker Compose para PostgreSQL
- [ ] Instalar dependências Drizzle ORM
- [ ] Criar configuração do banco (`src/db/config.ts`)
- [ ] Definir enums (`src/db/enums.ts`)
- [ ] Criar schema principal (`src/db/schema.ts`)
- [ ] Configurar Drizzle Kit (`drizzle.config.ts`)

### Fase 2: Migrations e Setup
- [ ] Gerar primeira migration (`npm run db:generate`)
- [ ] Aplicar migrations (`npm run db:migrate`)
- [ ] Testar conexão com banco
- [ ] Criar script de seed básico (`src/db/seed.ts`)
- [ ] Validar estrutura via Drizzle Studio

### Fase 3: Integrações
- [ ] Integrar com Next.js App Router
- [ ] Criar queries básicas (CRUD operations)
- [ ] Implementar lógica de ranking/leaderboard
- [ ] Adicionar validações Zod
- [ ] Configurar connection pooling

### Fase 4: Performance e Produção
- [ ] Otimizar índices do banco
- [ ] Implementar cache com Redis (opcional)
- [ ] Configurar backup automático
- [ ] Monitoramento de queries lentas
- [ ] Documentar APIs de banco

### Comandos Úteis

```bash
# ===========================================
# CONFIGURAÇÃO INICIAL
# ===========================================

# Clonar .env de exemplo
cp .env.example .env

# Dar permissão aos scripts
chmod +x docker/backup/scripts/*.sh

# Subir ambiente completo de desenvolvimento
make dev
# ou
docker-compose --profile dev up -d

# ===========================================
# DESENVOLVIMENTO
# ===========================================

# Ver logs em tempo real
make logs

# Ver apenas logs do PostgreSQL
make logs-db

# Acessar shell do banco
make db-shell

# Verificar status dos serviços
make status

# ===========================================
# DRIZZLE ORM
# ===========================================

# Instalar dependências
npm install drizzle-orm drizzle-kit pg @types/pg

# Gerar migration após mudanças no schema
npm run db:generate

# Aplicar migrations
npm run db:migrate

# Push direto (sem migration files) - desenvolvimento apenas
npm run db:push

# Abrir Drizzle Studio para visualizar dados
npm run db:studio

# ===========================================
# BACKUP E RESTORE
# ===========================================

# Fazer backup
make backup

# Restaurar backup específico
make restore BACKUP_FILE=/backup/devroast_backup_20240324_120000.sql.gz

# ===========================================
# LIMPEZA E RESET
# ===========================================

# Parar serviços
make down

# Reset completo do banco (CUIDADO!)
make reset-db

# Limpar tudo (volumes, containers, images)
make clean

# ===========================================
# PRODUÇÃO
# ===========================================

# Subir apenas serviços essenciais (sem adminer/pgadmin)
make prod

# Verificar health dos serviços
docker-compose ps

# Monitorar recursos
docker stats devroast-postgres devroast-redis

# ===========================================
# DEBUGGING
# ===========================================

# Verificar conexão com banco
docker exec devroast-postgres pg_isready -U devroast_user -d devroast

# Testar Redis
docker exec devroast-redis redis-cli ping

# Ver configurações do PostgreSQL
docker exec devroast-postgres psql -U devroast_user -d devroast -c "SHOW all;"

# Verificar extensões instaladas
docker exec devroast-postgres psql -U devroast_user -d devroast -c "SELECT * FROM pg_extension;"
```

### Troubleshooting Comum

#### Problemas de Conexão

```bash
# 1. Verificar se os containers estão rodando
docker-compose ps

# 2. Verificar logs do PostgreSQL
docker-compose logs postgres

# 3. Testar conexão manual
docker exec -it devroast-postgres psql -U devroast_user -d devroast

# 4. Verificar variáveis de ambiente
docker exec devroast-postgres env | grep POSTGRES
```

#### Problemas de Performance

```sql
-- Verificar queries lentas
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

-- Verificar índices não utilizados
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_tup_read = 0;

-- Verificar tamanho das tabelas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Monitoramento e Métricas

#### Queries Úteis para Monitoramento

```sql
-- Status geral do banco
SELECT 
  datname,
  numbackends as connections,
  xact_commit + xact_rollback as transactions,
  blks_read + blks_hit as block_access,
  tup_returned + tup_fetched as tuples_accessed
FROM pg_stat_database 
WHERE datname = 'devroast';

-- Conexões ativas
SELECT count(*) as active_connections,
       state,
       application_name
FROM pg_stat_activity 
WHERE datname = 'devroast'
GROUP BY state, application_name;

-- Locks ativos
SELECT count(*) as locks, mode, locktype 
FROM pg_locks 
WHERE database = (SELECT oid FROM pg_database WHERE datname = 'devroast')
GROUP BY mode, locktype;
```

## 📊 Queries Importantes

### Leaderboard Global
```sql
SELECT 
  u.username,
  cs.shame_score,
  cs.language,
  LEFT(cs.original_code, 100) as code_preview,
  cs.created_at
FROM code_submissions cs
JOIN users u ON cs.user_id = u.id
WHERE cs.status = 'completed'
ORDER BY cs.shame_score ASC, cs.created_at DESC
LIMIT 50;
```

### Estatísticas do Usuário
```sql
SELECT 
  COUNT(*) as total_submissions,
  AVG(shame_score) as average_score,
  MIN(shame_score) as best_score,
  MAX(shame_score) as worst_score
FROM code_submissions 
WHERE user_id = $1 AND status = 'completed';
```

---

**Esta especificação fornece a base completa para implementar o sistema DevRoast com Drizzle ORM e PostgreSQL. Siga o checklist para uma implementação organizada e eficiente!**