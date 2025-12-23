# Configuração do Supabase Storage para Fotos

Este documento descreve como configurar os buckets de armazenamento no Supabase para as fotos da aplicação AMA TRIP.

## Buckets Necessários

A aplicação requer 3 buckets de armazenamento no Supabase:

### 1. **service-orders** (Fotos de Ordens de Serviço)
- Armazena fotos anexadas às ordens de serviço
- Tipo: Público
- Políticas: Permitir upload e leitura pública

### 2. **odometer-photos** (Fotos de Odômetro)
- Armazena fotos do odômetro no início e fim das viagens
- Tipo: Público
- Políticas: Permitir upload e leitura pública

### 3. **fuel-receipts** (Comprovantes de Combustível)
- Armazena fotos dos comprovantes de abastecimento
- Tipo: Público
- Políticas: Permitir upload e leitura pública

## Como Criar os Buckets

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **Storage**
4. Clique em **New bucket**
5. Para cada bucket:
   - Nome: use exatamente os nomes acima (service-orders, odometer-photos, fuel-receipts)
   - Public bucket: **Marque como público** ✅
   - Clique em **Create bucket**

## Configurar Políticas de Acesso (RLS)

Para cada bucket criado, você precisa configurar as políticas de acesso:

### Política de Upload (INSERT)

```sql
-- Para service-orders
CREATE POLICY "Allow public uploads to service-orders"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'service-orders');

-- Para odometer-photos
CREATE POLICY "Allow public uploads to odometer-photos"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'odometer-photos');

-- Para fuel-receipts
CREATE POLICY "Allow public uploads to fuel-receipts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'fuel-receipts');
```

### Política de Leitura (SELECT)

```sql
-- Para service-orders
CREATE POLICY "Allow public access to service-orders"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-orders');

-- Para odometer-photos
CREATE POLICY "Allow public access to odometer-photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'odometer-photos');

-- Para fuel-receipts
CREATE POLICY "Allow public access to fuel-receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fuel-receipts');
```

## Atualizar Tabelas do Banco de Dados

Você também precisa adicionar colunas para armazenar as URLs das fotos:

```sql
-- Adicionar coluna para foto de ordem de serviço (já existe)
-- ALTER TABLE service_orders ADD COLUMN photo_url TEXT;

-- Adicionar colunas para fotos de odômetro nas viagens
ALTER TABLE trips ADD COLUMN start_odometer_photo TEXT;
ALTER TABLE trips ADD COLUMN end_odometer_photo TEXT;

-- Adicionar coluna para foto de comprovante de combustível
ALTER TABLE fuel_records ADD COLUMN receipt_photo TEXT;
```

## Verificação

Após configurar tudo, verifique:

1. ✅ Todos os 3 buckets estão criados e marcados como públicos
2. ✅ As políticas de INSERT e SELECT estão ativas para cada bucket
3. ✅ As colunas foram adicionadas às tabelas do banco de dados
4. ✅ Teste fazendo upload de uma imagem pela aplicação

## Troubleshooting

### Erro: "new row violates row-level security policy"
- Verifique se as políticas de INSERT foram criadas corretamente
- Certifique-se de que os buckets estão marcados como públicos

### Erro: "The resource was not found"
- Verifique se o nome do bucket está correto (exatamente como especificado)
- Confirme que o bucket foi criado no projeto correto

### Imagens não aparecem
- Verifique se as políticas de SELECT foram criadas
- Confirme que os buckets estão marcados como públicos
- Verifique se as URLs estão sendo salvas corretamente no banco de dados
