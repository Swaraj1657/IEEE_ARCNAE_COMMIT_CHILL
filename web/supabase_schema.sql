-- User Profiles table

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  is_kyc_completed boolean default false,
  is_kyc_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure optional plaintext password column exists (not recommended in production)
alter table public.user_profiles add column if not exists password text;

-- Certificates storage bucket
-- Create via Storage settings: bucket name "Certificates" (public: false)

-- Certificates table
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  uploaded_at timestamptz default now(),
  extracted_student_name text,
  extracted_roll_number text,
  extracted_registration_number text,
  extracted_apaar_id text,
  extracted_father_name text,
  extracted_mother_name text,
  extracted_degree text,
  extracted_branch text,
  extracted_semester text,
  extracted_examination text,
  issued_date date,
  extracted_institution_name text,
  extracted_established_year int,
  extracted_organization_type text,
  verification_source text,
  verification_status text default 'PENDING',
  forgery_risk_score int,
  verdict text,
  extracted_visuals jsonb,
  raw_extracted_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  certificate_link text
);

-- Row Level Security
alter table public.user_profiles enable row level security;
alter table public.certificates enable row level security;

-- Policies: users manage own profile
create policy "Users read own profile" on public.user_profiles
  for select using (auth.uid() = id);
create policy "Users insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Policies: certificates owned by user
create policy "Users read own certificates" on public.certificates
  for select using (auth.uid() = owner_id);
create policy "Users insert certificates" on public.certificates
  for insert with check (auth.uid() = owner_id);
create policy "Users update own certificates" on public.certificates
  for update using (auth.uid() = owner_id);

-- Optional: recruiter role can read verified certificates
-- Create a Postgres role 'recruiter' and grant read on verified rows
-- Or use anon key with restricted RPC; simplest policy:
create policy "Public read verified certificates" on public.certificates
  for select using (verification_status = 'VERIFIED');

-- Storage RLS for Certificates bucket
alter table storage.objects enable row level security;

-- Allow authenticated users to upload into their own UID folder in Certificates
create policy if not exists "certs_upload_by_owner" on storage.objects
  for insert
  with check (
    bucket_id = 'Certificates'
    and auth.role() = 'authenticated'
    and (name like (auth.uid())::text || '/%')
  );

-- Allow authenticated users to read their own files in Certificates
create policy if not exists "certs_read_by_owner" on storage.objects
  for select
  using (
    bucket_id = 'Certificates'
    and auth.role() = 'authenticated'
    and (name like (auth.uid())::text || '/%')
  );

-- Allow authenticated users to update/delete their own files in Certificates
create policy if not exists "certs_update_by_owner" on storage.objects
  for update
  using (
    bucket_id = 'Certificates'
    and auth.role() = 'authenticated'
    and (name like (auth.uid())::text || '/%')
  );
create policy if not exists "certs_delete_by_owner" on storage.objects
  for delete
  using (
    bucket_id = 'Certificates'
    and auth.role() = 'authenticated'
    and (name like (auth.uid())::text || '/%')
  );