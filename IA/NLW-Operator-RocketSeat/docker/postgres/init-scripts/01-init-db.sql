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