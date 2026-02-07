-- Create table for storing integration tokens (MercadoLibre, Falabella, etc.)
create table if not exists public.integraciones (
  id text primary key, -- 'MERCADOLIBRE', 'FALABELLA', etc.
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS (Row Level Security) but allow service role (backend) to access
alter table public.integraciones enable row level security;

-- Policy to allow the backend (Service Role) full access
create policy "Enable full access for service role"
  on public.integraciones
  using (true)
  with check (true);

-- Function to automatically update 'updated_at'
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_integraciones_updated_at
before update on public.integraciones
for each row
execute procedure update_updated_at_column();
