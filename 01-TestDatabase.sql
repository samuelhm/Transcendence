-- database/01-init.sql

-- 1. Configuración inicial y extensiones
-- Necesario para generar UUIDs v4 (gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Creación de la Tabla (Basado en tu dump)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    nickname character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    avatar_path text,
    city character varying(100),
    postal_code character varying(20),
    address_line text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints explícitos
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_nickname_key UNIQUE (nickname)
);

-- 3. Restauración de Datos (Data Seed)
-- Insertamos tu usuario actual para que tu Token JWT siga siendo válido.
-- Usamos 'ON CONFLICT DO NOTHING' para evitar errores si reinicias el contenedor sin borrar el volumen.
INSERT INTO public.users (
    id, 
    nickname, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    avatar_path, 
    is_active
) VALUES (
    '2f39b1eb-b741-4a44-8ea3-6099383238c2', -- TU UUID ACTUAL
    'vendedor1',
    'dev@example.com',
    '1234', -- Tu contraseña actual (texto plano para dev)
    'Juan',
    'Perez',
    NULL,
    true
) ON CONFLICT (id) DO NOTHING;

-- 4. Permisos (Solución al error 42501)
-- Garantizamos que cualquier usuario conectado (como 'admin' del docker-compose) pueda tocar la tabla.
GRANT ALL PRIVILEGES ON TABLE public.users TO public;