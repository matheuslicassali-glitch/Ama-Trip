# Configuração do Banco de Dados no Supabase

Copie e cole o SQL abaixo no **SQL Editor** do seu painel do Supabase para criar as tabelas necessárias:

```sql
-- Criar tabela de Carros
create table cars (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  model text not null,
  plate text not null,
  year text
);

-- Criar tabela de Motoristas
create table drivers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  license text not null,
  contact text
);

-- Criar tabela de Viagens
create table trips (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  car_id uuid references cars(id),
  driver_id uuid references drivers(id),
  start_km numeric not null,
  end_km numeric,
  origin text not null,
  destination text,
  start_time timestamp with time zone default timezone('utc'::text, now()) not null,
  end_time timestamp with time zone,
  observations text,
  status text default 'active' -- 'active' ou 'completed'
);

-- Criar tabela de Abastecimento
create table fuel_records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  car_id uuid references cars(id),
  liters numeric not null,
  value numeric not null,
  km numeric not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Realtime (opcional mas recomendado)
alter publication supabase_realtime add table cars;
alter publication supabase_realtime add table drivers;
alter publication supabase_realtime add table trips;
alter publication supabase_realtime add table fuel_records;

-- Desabilitar RLS temporariamente para facilitar o desenvolvimento
-- (Em produção, você deve configurar políticas de acesso!)
alter table cars disable row level security;
alter table drivers disable row level security;
alter table trips disable row level security;
alter table fuel_records disable row level security;
```
