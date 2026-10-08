-- QRaura schema (Supabase / Postgres). Run once in SQL Editor.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default 'My QR',
  description text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  style jsonb not null default '{"fg":"#111111","bg":"#ffffff","shape":"square"}'::jsonb,
  password_hash text,
  has_password boolean generated always as (password_hash is not null) stored,
  is_active boolean not null default true,
  scan_count integer not null default 0,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists qr_codes_owner_idx on public.qr_codes(owner, created_at desc);

alter table public.qr_codes enable row level security;

-- Owners may read/delete their own rows. All writes go through qr_save().
revoke all on public.qr_codes from anon, authenticated;
grant select (id, owner, slug, title, description, blocks, style, has_password, is_active, scan_count, last_scanned_at, created_at, updated_at)
  on public.qr_codes to authenticated;
grant delete on public.qr_codes to authenticated;
drop policy if exists qr_owner_select on public.qr_codes;
create policy qr_owner_select on public.qr_codes for select to authenticated using (owner = auth.uid());
drop policy if exists qr_owner_delete on public.qr_codes;
create policy qr_owner_delete on public.qr_codes for delete to authenticated using (owner = auth.uid());

-- Create / update a QR (owner only). p_password: null = keep, '' = remove, text = set.
create or replace function public.qr_save(
  p_id uuid, p_title text, p_description text, p_blocks jsonb,
  p_style jsonb, p_password text, p_active boolean
) returns public.qr_codes
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := auth.uid();
  rec public.qr_codes;
  new_slug text;
begin
  if uid is null then raise exception 'login required'; end if;
  if jsonb_typeof(coalesce(p_blocks,'[]'::jsonb)) <> 'array' then raise exception 'blocks must be array'; end if;
  if jsonb_array_length(coalesce(p_blocks,'[]'::jsonb)) > 60 then raise exception 'too many blocks'; end if;
  if length(coalesce(p_blocks,'[]'::jsonb)::text) > 200000 then raise exception 'content too large'; end if;

  if p_id is null then
    if (select count(*) from public.qr_codes where owner = uid) >= 100 then raise exception 'QR limit reached (100)'; end if;
    loop
      new_slug := substr(translate(encode(gen_random_bytes(9),'base64'),'+/=','abc'),1,8);
      new_slug := lower(new_slug);
      exit when not exists (select 1 from public.qr_codes where slug = new_slug);
    end loop;
    insert into public.qr_codes(owner, slug, title, description, blocks, style, password_hash, is_active)
    values (uid, new_slug, left(coalesce(nullif(p_title,''),'My QR'),120), left(coalesce(p_description,''),1000),
            coalesce(p_blocks,'[]'::jsonb), coalesce(p_style, '{"fg":"#111111","bg":"#ffffff","shape":"square"}'::jsonb),
            case when coalesce(p_password,'') = '' then null else crypt(p_password, gen_salt('bf')) end,
            coalesce(p_active,true))
    returning * into rec;
  else
    update public.qr_codes set
      title = left(coalesce(nullif(p_title,''),'My QR'),120),
      description = left(coalesce(p_description,''),1000),
      blocks = coalesce(p_blocks,'[]'::jsonb),
      style = coalesce(p_style, style),
      password_hash = case when p_password is null then password_hash
                           when p_password = '' then null
                           else crypt(p_password, gen_salt('bf')) end,
      is_active = coalesce(p_active, is_active),
      updated_at = now()
    where id = p_id and owner = uid
    returning * into rec;
    if rec.id is null then raise exception 'not found'; end if;
  end if;
  return rec;
end $$;
revoke all on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean) from public, anon;
grant execute on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean) to authenticated;

-- Public scan endpoint: returns content (or locked / not found). Counts a scan on success.
create or replace function public.qr_scan(p_slug text, p_password text default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.qr_codes;
begin
  select * into r from public.qr_codes where slug = lower(p_slug);
  if r.id is null or not r.is_active then return jsonb_build_object('status','not_found'); end if;
  if r.password_hash is not null then
    if p_password is null then
      return jsonb_build_object('status','locked','title',r.title);
    end if;
    if crypt(p_password, r.password_hash) <> r.password_hash then
      perform pg_sleep(0.7);
      return jsonb_build_object('status','wrong_password','title',r.title);
    end if;
  end if;
  update public.qr_codes set scan_count = scan_count + 1, last_scanned_at = now() where id = r.id;
  return jsonb_build_object('status','ok','title',r.title,'description',r.description,'blocks',r.blocks);
end $$;
grant execute on function public.qr_scan(text,text) to anon, authenticated;

-- Storage bucket for images/files (10 MB per file)
insert into storage.buckets (id, name, public, file_size_limit)
values ('qr-files','qr-files', true, 10485760)
on conflict (id) do update set file_size_limit = 10485760;

drop policy if exists qr_files_insert on storage.objects;
create policy qr_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'qr-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists qr_files_delete on storage.objects;
create policy qr_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'qr-files' and (storage.foldername(name))[1] = auth.uid()::text);
