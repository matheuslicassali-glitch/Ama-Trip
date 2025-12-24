# Solução de Problemas: Upload de Imagens no Supabase

Se você está vendo erros ao tentar fazer upload de imagens ("Falha no upload...", "Bucket not found", etc.), siga estes passos:

## 1. Verifique se os Buckets existem

No painel do Supabase (https://app.supabase.com):
1. Vá para a seção **Storage**.
2. Verifique se você criou EXATAMENTE estes 3 buckets (nomes devem ser idênticos):
   - `service-orders`
   - `odometer-photos`
   - `fuel-receipts`

## 2. Verifique se os Buckets são Públicos

Ao clicar na engrenagem (configurações) de cada bucket, a opção "Public bucket" deve estar ativada.

## 3. Verifique as Políticas (RLS)

Se os buckets existem mas o erro persiste, as políticas de segurança podem estar bloqueando o upload.

Vá em **Authentication > Policies** ou na aba **Policies** dentro do Storage.

Você deve ter políticas que permitam:
- **SELECT** (Leitura): para todo mundo (`anon` e `authenticated`) ou `public`.
- **INSERT** (Upload): para todo mundo (`anon` e `authenticated`) ou `public`.

Exemplo de SQL para corrigir permissões (Execute no SQL Editor):

```sql
-- Habilitar acesso público para service-orders
create policy "Public Access Service Orders"
on storage.objects for select
using ( bucket_id = 'service-orders' );

create policy "Public Upload Service Orders"
on storage.objects for insert
with check ( bucket_id = 'service-orders' );

-- Habilitar acesso público para odometer-photos
create policy "Public Access Odometer"
on storage.objects for select
using ( bucket_id = 'odometer-photos' );

create policy "Public Upload Odometer"
on storage.objects for insert
with check ( bucket_id = 'odometer-photos' );

-- Habilitar acesso público para fuel-receipts
create policy "Public Access Fuel Receipts"
on storage.objects for select
using ( bucket_id = 'fuel-receipts' );

create policy "Public Upload Fuel Receipts"
on storage.objects for insert
with check ( bucket_id = 'fuel-receipts' );
```

## 4. Tamanho do Arquivo

O Supabase tem limite de tamanho de arquivo (padrão 50MB). Se tentar enviar algo maior, falhará.
