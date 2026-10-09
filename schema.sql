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
  public_index boolean not null default false,
  scan_count integer not null default 0,
  last_scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists qr_codes_owner_idx on public.qr_codes(owner, created_at desc);

alter table public.qr_codes enable row level security;

-- Owners may read/delete their own rows. All writes go through qr_save().
revoke all on public.qr_codes from anon, authenticated;
grant select (id, owner, slug, title, description, blocks, style, has_password, is_active, public_index, scan_count, last_scanned_at, created_at, updated_at)
  on public.qr_codes to authenticated;
grant delete on public.qr_codes to authenticated;
drop policy if exists qr_owner_select on public.qr_codes;
create policy qr_owner_select on public.qr_codes for select to authenticated using (owner = auth.uid());
drop policy if exists qr_owner_delete on public.qr_codes;
create policy qr_owner_delete on public.qr_codes for delete to authenticated using (owner = auth.uid());

-- Create / update a QR (owner only). p_password: null = keep, '' = remove, text = set.
drop function if exists public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean);
drop function if exists public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean);
create or replace function public.qr_save(
  p_id uuid, p_title text, p_description text, p_blocks jsonb,
  p_style jsonb, p_password text, p_active boolean, p_public boolean default null
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := auth.uid();
  rec public.qr_codes;
  new_slug text;
begin
  if uid is null then raise exception 'login required'; end if;
  if jsonb_typeof(coalesce(p_blocks,'[]'::jsonb)) <> 'array' then raise exception 'blocks must be array'; end if;
  if jsonb_array_length(coalesce(p_blocks,'[]'::jsonb)) > 60 then raise exception 'too many blocks'; end if;
  if exists (
    select 1 from jsonb_array_elements(coalesce(p_blocks,'[]'::jsonb)) b
    where coalesce(b->>'type','') not in ('text','link','image','file','detail','phone','whatsapp','email','location','upi')
  ) then raise exception 'unsupported block type (video is not allowed)'; end if;
  if length(coalesce(p_blocks,'[]'::jsonb)::text) > 200000 then raise exception 'content too large'; end if;

  if p_id is null then
    if (select count(*) from public.qr_codes where owner = uid) >= 100 then raise exception 'QR limit reached (100)'; end if;
    loop
      new_slug := substr(translate(encode(gen_random_bytes(9),'base64'),'+/=','abc'),1,8);
      new_slug := lower(new_slug);
      exit when not exists (select 1 from public.qr_codes where slug = new_slug);
    end loop;
    insert into public.qr_codes(owner, slug, title, description, blocks, style, password_hash, is_active, public_index)
    values (uid, new_slug, left(coalesce(nullif(p_title,''),'My QR'),120), left(coalesce(p_description,''),1000),
            coalesce(p_blocks,'[]'::jsonb), coalesce(p_style, '{"fg":"#111111","bg":"#ffffff","shape":"square"}'::jsonb),
            case when coalesce(p_password,'') = '' then null else crypt(p_password, gen_salt('bf')) end,
            coalesce(p_active,true), coalesce(p_public,false) and coalesce(p_password,'') = '')
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
      public_index = case when p_password is not null and p_password <> '' then false
                          when p_password = '' then coalesce(p_public, public_index)
                          when password_hash is not null then false
                          else coalesce(p_public, public_index) end,
      updated_at = now()
    where id = p_id and owner = uid
    returning * into rec;
    if rec.id is null then raise exception 'not found'; end if;
  end if;
  return to_jsonb(rec) - 'password_hash';
end $$;
revoke all on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean) from public, anon;
grant execute on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean) to authenticated;

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


-- Opt-in Google indexing: only active, password-free QRs with public_index = true.
create or replace function public.qr_public_meta(p_slug text) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when r.id is null then jsonb_build_object('public', false)
    else jsonb_build_object('public', true, 'title', r.title, 'description', r.description,
      'updated_at', r.updated_at,
      'blocks', coalesce((select jsonb_agg(jsonb_build_object('type', b->>'type', 'label', left(coalesce(b->>'label',''),200), 'value', left(coalesce(b->>'value',''),1000)))
                          from jsonb_array_elements(r.blocks) b where b->>'type' in ('text','link','detail','location')), '[]'::jsonb)) end
  from (select 1) x left join public.qr_codes r on r.slug = lower(p_slug) and r.is_active and r.public_index and r.password_hash is null;
$$;
grant execute on function public.qr_public_meta(text) to anon, authenticated;
create or replace function public.qr_public_list() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('slug', slug, 'updated_at', updated_at)), '[]'::jsonb)
  from (select slug, updated_at from public.qr_codes where is_active and public_index and password_hash is null order by updated_at desc limit 5000) t;
$$;
grant execute on function public.qr_public_list() to anon, authenticated;

-- Storage bucket: photos + PDF/documents only (NO video/audio), max 40 MB per file.
-- Note: Supabase's global upload limit (Dashboard -> Storage -> Settings) must be >= 40 MB (free plan max is 50 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('qr-files','qr-files', true, 41943040, array[
  'image/jpeg','image/png','image/webp','image/gif','image/avif','image/heic','image/heif',
  'application/pdf','text/plain',
  'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation'
])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types, public = true;

drop policy if exists qr_files_insert on storage.objects;
create policy qr_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'qr-files' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists qr_files_delete on storage.objects;
create policy qr_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'qr-files' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== Qrown v2 upgrade (analytics, expiry, contact/wifi blocks) =====
alter table public.qr_codes add column if not exists expires_at timestamptz;
alter table public.qr_codes add column if not exists max_scans integer check (max_scans is null or max_scans between 1 and 1000000);
grant select (expires_at, max_scans) on public.qr_codes to authenticated;
create table if not exists public.qr_scan_log (
  id bigint generated always as identity primary key,
  qr_id uuid not null references public.qr_codes(id) on delete cascade,
  at timestamptz not null default now(),
  dev text
);
create index if not exists qr_scan_log_idx on public.qr_scan_log(qr_id, at desc);
alter table public.qr_scan_log enable row level security;
revoke all on public.qr_scan_log from anon, authenticated;
drop function if exists public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean);
drop function if exists public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean);
drop function if exists public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean,jsonb);
create or replace function public.qr_save(
  p_id uuid, p_title text, p_description text, p_blocks jsonb,
  p_style jsonb, p_password text, p_active boolean, p_public boolean default null, p_limits jsonb default null
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := auth.uid();
  rec public.qr_codes;
  new_slug text;
begin
  if uid is null then raise exception 'login required'; end if;
  if jsonb_typeof(coalesce(p_blocks,'[]'::jsonb)) <> 'array' then raise exception 'blocks must be array'; end if;
  if jsonb_array_length(coalesce(p_blocks,'[]'::jsonb)) > 60 then raise exception 'too many blocks'; end if;
  if exists (
    select 1 from jsonb_array_elements(coalesce(p_blocks,'[]'::jsonb)) b
    where coalesce(b->>'type','') not in ('text','link','image','file','detail','phone','whatsapp','email','location','upi','contact','wifi')
  ) then raise exception 'unsupported block type (video is not allowed)'; end if;
  if length(coalesce(p_blocks,'[]'::jsonb)::text) > 200000 then raise exception 'content too large'; end if;

  if p_id is null then
    if (select count(*) from public.qr_codes where owner = uid) >= 100 then raise exception 'QR limit reached (100)'; end if;
    loop
      new_slug := substr(translate(encode(gen_random_bytes(9),'base64'),'+/=','abc'),1,8);
      new_slug := lower(new_slug);
      exit when not exists (select 1 from public.qr_codes where slug = new_slug);
    end loop;
    insert into public.qr_codes(owner, slug, title, description, blocks, style, password_hash, is_active, public_index, expires_at, max_scans)
    values (uid, new_slug, left(coalesce(nullif(p_title,''),'My QR'),120), left(coalesce(p_description,''),1000),
            coalesce(p_blocks,'[]'::jsonb), coalesce(p_style, '{"fg":"#111111","bg":"#ffffff","shape":"square"}'::jsonb),
            case when coalesce(p_password,'') = '' then null else crypt(p_password, gen_salt('bf')) end,
            coalesce(p_active,true), coalesce(p_public,false) and coalesce(p_password,'') = '',
            nullif(p_limits->>'expires_at','')::timestamptz, nullif(p_limits->>'max_scans','')::integer)
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
      public_index = case when p_password is not null and p_password <> '' then false
                          when p_password = '' then coalesce(p_public, public_index)
                          when password_hash is not null then false
                          else coalesce(p_public, public_index) end,
      expires_at = case when p_limits is null then expires_at else nullif(p_limits->>'expires_at','')::timestamptz end,
      max_scans = case when p_limits is null then max_scans else nullif(p_limits->>'max_scans','')::integer end,
      updated_at = now()
    where id = p_id and owner = uid
    returning * into rec;
    if rec.id is null then raise exception 'not found'; end if;
  end if;
  return to_jsonb(rec) - 'password_hash';
end $$;
revoke all on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean,jsonb) from public, anon;
grant execute on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean,jsonb) to authenticated;


drop function if exists public.qr_scan(text,text);
create or replace function public.qr_scan(p_slug text, p_password text default null, p_dev text default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.qr_codes; d text;
begin
  select * into r from public.qr_codes where slug = lower(p_slug);
  if r.id is null or not r.is_active then return jsonb_build_object('status','not_found'); end if;
  if (r.expires_at is not null and r.expires_at < now()) or (r.max_scans is not null and r.scan_count >= r.max_scans) then
    return jsonb_build_object('status','expired','title',r.title);
  end if;
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
  d := case when p_dev in ('mobile','tablet','desktop') then p_dev else 'other' end;
  insert into public.qr_scan_log(qr_id, dev) values (r.id, d);
  return jsonb_build_object('status','ok','title',r.title,'description',r.description,'blocks',r.blocks,
    'left', case when r.max_scans is null then null else greatest(r.max_scans - r.scan_count - 1, 0) end);
end $$;
grant execute on function public.qr_scan(text,text,text) to anon, authenticated;

create or replace function public.qr_stats(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare o uuid; sc int; res jsonb; today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  select owner, scan_count into o, sc from public.qr_codes where id = p_id;
  if o is null or o is distinct from auth.uid() then raise exception 'not found'; end if;
  select jsonb_build_object(
    'total', sc,
    'today', (select count(*) from public.qr_scan_log where qr_id = p_id and (at at time zone 'Asia/Kolkata')::date = today),
    'days', (select coalesce(jsonb_agg(jsonb_build_object('d', to_char(g.d,'YYYY-MM-DD'), 'n', coalesce(c.n,0)) order by g.d), '[]'::jsonb)
             from (select generate_series(today-13, today, interval '1 day')::date as d) g
             left join (select (at at time zone 'Asia/Kolkata')::date as dd, count(*) as n from public.qr_scan_log where qr_id = p_id group by 1) c on c.dd = g.d),
    'dev', (select coalesce(jsonb_object_agg(coalesce(dev,'other'), n), '{}'::jsonb) from (select dev, count(*) n from public.qr_scan_log where qr_id = p_id group by dev) t),
    'last', (select max(at) from public.qr_scan_log where qr_id = p_id)
  ) into res;
  return res;
end $$;
revoke all on function public.qr_stats(uuid) from public, anon;
grant execute on function public.qr_stats(uuid) to authenticated;

-- ===== Qrown v3: folders, scheduling, themes/cover, lead forms, activity =====
-- Qrown v3: folders, scheduling, viewer look (theme/cover/welcome), lead forms, activity feed
alter table public.qr_codes add column if not exists folder text check (folder is null or char_length(folder) <= 30);
alter table public.qr_codes add column if not exists starts_at timestamptz;
alter table public.qr_codes add column if not exists view jsonb not null default '{}'::jsonb;
grant select (folder, starts_at, view) on public.qr_codes to authenticated;

create table if not exists public.qr_leads (
  id bigint generated always as identity primary key,
  qr_id uuid not null references public.qr_codes(id) on delete cascade,
  at timestamptz not null default now(),
  name text, phone text, msg text
);
create index if not exists qr_leads_idx on public.qr_leads(qr_id, at desc);
alter table public.qr_leads enable row level security;
revoke all on public.qr_leads from anon, authenticated;

drop function if exists public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean,jsonb);
create or replace function public.qr_save(
  p_id uuid, p_title text, p_description text, p_blocks jsonb,
  p_style jsonb, p_password text, p_active boolean, p_public boolean default null, p_limits jsonb default null,
  p_folder text default null, p_view jsonb default null
) returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare
  uid uuid := auth.uid();
  rec public.qr_codes;
  new_slug text;
  fld text := left(btrim(coalesce(p_folder,'')),30);
begin
  if uid is null then raise exception 'login required'; end if;
  if jsonb_typeof(coalesce(p_blocks,'[]'::jsonb)) <> 'array' then raise exception 'blocks must be array'; end if;
  if jsonb_array_length(coalesce(p_blocks,'[]'::jsonb)) > 60 then raise exception 'too many blocks'; end if;
  if exists (
    select 1 from jsonb_array_elements(coalesce(p_blocks,'[]'::jsonb)) b
    where coalesce(b->>'type','') not in ('text','link','image','file','detail','phone','whatsapp','email','location','upi','contact','wifi','links','social','lead')
  ) then raise exception 'unsupported block type (video is not allowed)'; end if;
  if length(coalesce(p_blocks,'[]'::jsonb)::text) > 200000 then raise exception 'content too large'; end if;
  if p_view is not null and (jsonb_typeof(p_view) <> 'object' or length(p_view::text) > 4000) then raise exception 'invalid look settings'; end if;

  if p_id is null then
    if (select count(*) from public.qr_codes where owner = uid) >= 100 then raise exception 'QR limit reached (100)'; end if;
    loop
      new_slug := substr(translate(encode(gen_random_bytes(9),'base64'),'+/=','abc'),1,8);
      new_slug := lower(new_slug);
      exit when not exists (select 1 from public.qr_codes where slug = new_slug);
    end loop;
    insert into public.qr_codes(owner, slug, title, description, blocks, style, password_hash, is_active, public_index, expires_at, max_scans, starts_at, folder, view)
    values (uid, new_slug, left(coalesce(nullif(p_title,''),'My QR'),120), left(coalesce(p_description,''),1000),
            coalesce(p_blocks,'[]'::jsonb), coalesce(p_style, '{"fg":"#111111","bg":"#ffffff","shape":"square"}'::jsonb),
            case when coalesce(p_password,'') = '' then null else crypt(p_password, gen_salt('bf')) end,
            coalesce(p_active,true), coalesce(p_public,false) and coalesce(p_password,'') = '',
            nullif(p_limits->>'expires_at','')::timestamptz, nullif(p_limits->>'max_scans','')::integer,
            nullif(p_limits->>'starts_at','')::timestamptz, nullif(fld,''), coalesce(p_view,'{}'::jsonb))
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
      public_index = case when p_password is not null and p_password <> '' then false
                          when p_password = '' then coalesce(p_public, public_index)
                          when password_hash is not null then false
                          else coalesce(p_public, public_index) end,
      expires_at = case when p_limits is null then expires_at else nullif(p_limits->>'expires_at','')::timestamptz end,
      max_scans = case when p_limits is null then max_scans else nullif(p_limits->>'max_scans','')::integer end,
      starts_at = case when p_limits is null then starts_at else nullif(p_limits->>'starts_at','')::timestamptz end,
      folder = case when p_folder is null then folder else nullif(fld,'') end,
      view = coalesce(p_view, view),
      updated_at = now()
    where id = p_id and owner = uid
    returning * into rec;
    if rec.id is null then raise exception 'not found'; end if;
  end if;
  return to_jsonb(rec) - 'password_hash';
end $$;
revoke all on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean,jsonb,text,jsonb) from public, anon;
grant execute on function public.qr_save(uuid,text,text,jsonb,jsonb,text,boolean,boolean,jsonb,text,jsonb) to authenticated;

create or replace function public.qr_scan(p_slug text, p_password text default null, p_dev text default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.qr_codes; d text;
begin
  select * into r from public.qr_codes where slug = lower(p_slug);
  if r.id is null or not r.is_active then return jsonb_build_object('status','not_found'); end if;
  if r.starts_at is not null and r.starts_at > now() then
    return jsonb_build_object('status','notyet','title',r.title,'starts_at',r.starts_at,'view',jsonb_build_object('theme', r.view->>'theme'));
  end if;
  if (r.expires_at is not null and r.expires_at < now()) or (r.max_scans is not null and r.scan_count >= r.max_scans) then
    return jsonb_build_object('status','expired','title',r.title);
  end if;
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
  d := case when p_dev in ('mobile','tablet','desktop') then p_dev else 'other' end;
  insert into public.qr_scan_log(qr_id, dev) values (r.id, d);
  return jsonb_build_object('status','ok','title',r.title,'description',r.description,'blocks',r.blocks,'view',r.view,
    'left', case when r.max_scans is null then null else greatest(r.max_scans - r.scan_count - 1, 0) end);
end $$;
grant execute on function public.qr_scan(text,text,text) to anon, authenticated;

create or replace function public.qr_lead_submit(p_slug text, p_name text, p_phone text, p_msg text, p_password text default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.qr_codes;
begin
  select * into r from public.qr_codes where slug = lower(p_slug);
  if r.id is null or not r.is_active then raise exception 'QR not found'; end if;
  if (r.expires_at is not null and r.expires_at < now()) or (r.starts_at is not null and r.starts_at > now()) then raise exception 'QR not active'; end if;
  if not exists (select 1 from jsonb_array_elements(r.blocks) b where b->>'type' = 'lead') then raise exception 'form not available'; end if;
  if r.password_hash is not null and (p_password is null or crypt(p_password, r.password_hash) <> r.password_hash) then raise exception 'locked'; end if;
  if coalesce(btrim(p_name),'') = '' and coalesce(btrim(p_phone),'') = '' and coalesce(btrim(p_msg),'') = '' then raise exception 'empty form'; end if;
  if (select count(*) from public.qr_leads where qr_id = r.id and at > now() - interval '1 minute') >= 20 then raise exception 'too many submissions, try later'; end if;
  if (select count(*) from public.qr_leads where qr_id = r.id) >= 2000 then raise exception 'form is full'; end if;
  insert into public.qr_leads(qr_id, name, phone, msg) values (r.id, left(btrim(coalesce(p_name,'')),80), left(btrim(coalesce(p_phone,'')),30), left(btrim(coalesce(p_msg,'')),600));
  return jsonb_build_object('ok', true);
end $$;
grant execute on function public.qr_lead_submit(text,text,text,text,text) to anon, authenticated;

create or replace function public.qr_leads_list(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  select owner into o from public.qr_codes where id = p_id;
  if o is null or o is distinct from auth.uid() then raise exception 'not found'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('id',id,'at',at,'name',name,'phone',phone,'msg',msg) order by at desc), '[]'::jsonb)
          from (select * from public.qr_leads where qr_id = p_id order by at desc limit 500) t);
end $$;
revoke all on function public.qr_leads_list(uuid) from public, anon;
grant execute on function public.qr_leads_list(uuid) to authenticated;

create or replace function public.qr_leads_clear(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  select owner into o from public.qr_codes where id = p_id;
  if o is null or o is distinct from auth.uid() then raise exception 'not found'; end if;
  delete from public.qr_leads where qr_id = p_id;
end $$;
revoke all on function public.qr_leads_clear(uuid) from public, anon;
grant execute on function public.qr_leads_clear(uuid) to authenticated;

create or replace function public.qr_lead_counts() returns jsonb
language sql security definer set search_path = public as $$
  select coalesce(jsonb_object_agg(qr_id, n), '{}'::jsonb) from (
    select l.qr_id, count(*) n from public.qr_leads l join public.qr_codes c on c.id = l.qr_id where c.owner = auth.uid() group by l.qr_id) t;
$$;
revoke all on function public.qr_lead_counts() from public, anon;
grant execute on function public.qr_lead_counts() to authenticated;

create or replace function public.qr_activity(p_since timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s timestamptz := coalesce(p_since, now() - interval '7 days'); res jsonb;
begin
  if uid is null then raise exception 'login required'; end if;
  if s < now() - interval '30 days' then s := now() - interval '30 days'; end if;
  select jsonb_build_object(
    'scans', (select count(*) from public.qr_scan_log l join public.qr_codes c on c.id = l.qr_id where c.owner = uid and l.at > s),
    'leads', (select count(*) from public.qr_leads l join public.qr_codes c on c.id = l.qr_id where c.owner = uid and l.at > s),
    'items', (select coalesce(jsonb_agg(x order by (x->>'at') desc), '[]'::jsonb) from (
        select * from (
          select jsonb_build_object('k','scan','at',l.at,'t',c.title,'id',c.id,'x',l.dev) x from public.qr_scan_log l join public.qr_codes c on c.id = l.qr_id where c.owner = uid and l.at > s order by l.at desc limit 25
        ) a
        union all
        select * from (
          select jsonb_build_object('k','lead','at',l.at,'t',c.title,'id',c.id,'x',l.name) x from public.qr_leads l join public.qr_codes c on c.id = l.qr_id where c.owner = uid and l.at > s order by l.at desc limit 25
        ) b
      ) u)
  ) into res;
  return res;
end $$;
revoke all on function public.qr_activity(timestamptz) from public, anon;
grant execute on function public.qr_activity(timestamptz) to authenticated;

-- ===== Qrown v4 =====
-- Qrown v4: notifications auto-hide 12h after they were seen
alter table public.qr_scan_log add column if not exists notif_seen_at timestamptz;
alter table public.qr_leads add column if not exists notif_seen_at timestamptz;
update public.qr_scan_log set notif_seen_at = now() - interval '13 hours' where notif_seen_at is null;
update public.qr_leads set notif_seen_at = now() - interval '13 hours' where notif_seen_at is null;
create index if not exists qr_scan_log_unseen_idx on public.qr_scan_log(qr_id) where notif_seen_at is null;
create index if not exists qr_leads_unseen_idx on public.qr_leads(qr_id) where notif_seen_at is null;

create or replace function public.qr_activity(p_since timestamptz) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); s timestamptz := coalesce(p_since, now() - interval '30 days'); res jsonb;
begin
  if uid is null then raise exception 'login required'; end if;
  if s < now() - interval '30 days' then s := now() - interval '30 days'; end if;
  select jsonb_build_object(
    'scans', (select count(*) from public.qr_scan_log l join public.qr_codes c on c.id = l.qr_id where c.owner = uid and l.at > s and l.notif_seen_at is null),
    'leads', (select count(*) from public.qr_leads l join public.qr_codes c on c.id = l.qr_id where c.owner = uid and l.at > s and l.notif_seen_at is null),
    'items', (select coalesce(jsonb_agg(x order by (x->>'at') desc), '[]'::jsonb) from (
        select * from (
          select jsonb_build_object('k','scan','at',l.at,'t',c.title,'id',c.id,'x',l.dev,'s',l.notif_seen_at is not null) x
          from public.qr_scan_log l join public.qr_codes c on c.id = l.qr_id
          where c.owner = uid and l.at > now() - interval '30 days' and (l.notif_seen_at is null or l.notif_seen_at > now() - interval '12 hours') order by l.at desc limit 30
        ) a
        union all
        select * from (
          select jsonb_build_object('k','lead','at',l.at,'t',c.title,'id',c.id,'x',l.name,'s',l.notif_seen_at is not null) x
          from public.qr_leads l join public.qr_codes c on c.id = l.qr_id
          where c.owner = uid and l.at > now() - interval '30 days' and (l.notif_seen_at is null or l.notif_seen_at > now() - interval '12 hours') order by l.at desc limit 30
        ) b
      ) u)
  ) into res;
  return res;
end $$;
revoke all on function public.qr_activity(timestamptz) from public, anon;
grant execute on function public.qr_activity(timestamptz) to authenticated;

create or replace function public.qr_notif_seen() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'login required'; end if;
  update public.qr_scan_log l set notif_seen_at = now() from public.qr_codes c where c.id = l.qr_id and c.owner = uid and l.notif_seen_at is null;
  update public.qr_leads l set notif_seen_at = now() from public.qr_codes c where c.id = l.qr_id and c.owner = uid and l.notif_seen_at is null;
end $$;
revoke all on function public.qr_notif_seen() from public, anon;
grant execute on function public.qr_notif_seen() to authenticated;

create or replace function public.qr_notif_clear() returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'login required'; end if;
  update public.qr_scan_log l set notif_seen_at = now() - interval '13 hours' from public.qr_codes c where c.id = l.qr_id and c.owner = uid and (l.notif_seen_at is null or l.notif_seen_at > now() - interval '12 hours');
  update public.qr_leads l set notif_seen_at = now() - interval '13 hours' from public.qr_codes c where c.id = l.qr_id and c.owner = uid and (l.notif_seen_at is null or l.notif_seen_at > now() - interval '12 hours');
end $$;
revoke all on function public.qr_notif_clear() from public, anon;
grant execute on function public.qr_notif_clear() to authenticated;
-- Qrown v5: fair-use limits (monthly scans + per-user storage)
create table if not exists public.qr_limits (key text primary key, val int not null);
insert into public.qr_limits(key, val) values ('monthly_scans', 40), ('storage_mb', 80) on conflict (key) do nothing;
alter table public.qr_limits enable row level security;
revoke all on public.qr_limits from anon, authenticated;

create table if not exists public.qr_limit_override (
  owner uuid primary key references auth.users(id) on delete cascade,
  monthly_scans int, storage_mb int
);
alter table public.qr_limit_override enable row level security;
revoke all on public.qr_limit_override from anon, authenticated;

create table if not exists public.qr_usage_month (
  owner uuid not null references auth.users(id) on delete cascade,
  month date not null,
  scans int not null default 0,
  primary key (owner, month)
);
alter table public.qr_usage_month enable row level security;
revoke all on public.qr_usage_month from anon, authenticated;

create or replace function public.qr_lim(p_owner uuid, p_key text) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(
    case p_key when 'monthly_scans' then (select monthly_scans from public.qr_limit_override where owner = p_owner)
               else (select storage_mb from public.qr_limit_override where owner = p_owner) end,
    (select val from public.qr_limits where key = p_key), 0)
$$;
revoke all on function public.qr_lim(uuid, text) from public, anon, authenticated;

create or replace function public.qr_storage_bytes(p_owner uuid) returns bigint
language sql stable security definer set search_path = public, storage as $$
  select coalesce(sum(coalesce((metadata->>'size')::bigint, 0)), 0)::bigint from storage.objects
  where bucket_id = 'qr-files' and name like p_owner::text || '/%'
$$;
revoke all on function public.qr_storage_bytes(uuid) from public, anon, authenticated;

create or replace function public.qr_storage_ok() returns boolean
language sql stable security definer set search_path = public as $$
  select public.qr_storage_bytes(auth.uid()) < public.qr_lim(auth.uid(), 'storage_mb')::bigint * 1048576
$$;
revoke all on function public.qr_storage_ok() from public, anon;
grant execute on function public.qr_storage_ok() to authenticated;

create or replace function public.qr_usage() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); m date := date_trunc('month', now() at time zone 'Asia/Kolkata')::date; sc int;
begin
  if uid is null then raise exception 'login required'; end if;
  select scans into sc from public.qr_usage_month where owner = uid and month = m;
  return jsonb_build_object('scans', coalesce(sc,0), 'scan_limit', public.qr_lim(uid,'monthly_scans'),
    'bytes', public.qr_storage_bytes(uid), 'mb_limit', public.qr_lim(uid,'storage_mb'), 'resets', (m + interval '1 month')::date);
end $$;
revoke all on function public.qr_usage() from public, anon;
grant execute on function public.qr_usage() to authenticated;

drop policy if exists qr_files_insert on storage.objects;
create policy qr_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'qr-files' and (storage.foldername(name))[1] = auth.uid()::text and public.qr_storage_ok());
drop policy if exists qr_files_select on storage.objects;
create policy qr_files_select on storage.objects for select to authenticated
  using (bucket_id = 'qr-files' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.qr_scan(p_slug text, p_password text default null, p_dev text default null)
returns jsonb
language plpgsql security definer set search_path = public, extensions as $$
declare r public.qr_codes; d text; m date := date_trunc('month', now() at time zone 'Asia/Kolkata')::date; sc int;
begin
  select * into r from public.qr_codes where slug = lower(p_slug);
  if r.id is null or not r.is_active then return jsonb_build_object('status','not_found'); end if;
  if r.starts_at is not null and r.starts_at > now() then
    return jsonb_build_object('status','notyet','title',r.title,'starts_at',r.starts_at,'view',jsonb_build_object('theme', r.view->>'theme'));
  end if;
  if (r.expires_at is not null and r.expires_at < now()) or (r.max_scans is not null and r.scan_count >= r.max_scans) then
    return jsonb_build_object('status','expired','title',r.title);
  end if;
  if public.qr_storage_bytes(r.owner) > public.qr_lim(r.owner,'storage_mb')::bigint * 1048576 then
    return jsonb_build_object('status','storage_full','title',r.title);
  end if;
  select scans into sc from public.qr_usage_month where owner = r.owner and month = m;
  if coalesce(sc,0) >= public.qr_lim(r.owner,'monthly_scans') then
    return jsonb_build_object('status','scan_limit','title',r.title);
  end if;
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
  insert into public.qr_usage_month(owner, month, scans) values (r.owner, m, 1)
    on conflict (owner, month) do update set scans = public.qr_usage_month.scans + 1;
  d := case when p_dev in ('mobile','tablet','desktop') then p_dev else 'other' end;
  insert into public.qr_scan_log(qr_id, dev) values (r.id, d);
  return jsonb_build_object('status','ok','title',r.title,'description',r.description,'blocks',r.blocks,'view',r.view,
    'left', case when r.max_scans is null then null else greatest(r.max_scans - r.scan_count - 1, 0) end);
end $$;
grant execute on function public.qr_scan(text,text,text) to anon, authenticated;
