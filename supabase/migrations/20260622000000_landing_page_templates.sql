-- Create landing_page_templates table
create table if not exists landing_page_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  description text,
  category text not null default 'Khác',
  tags text[] default '{}',
  thumbnail_url text,
  preview_image_url text,
  editor_data jsonb not null,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  price_type text not null default 'free',
  views_count integer not null default 0,
  downloads_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table landing_page_templates enable row level security;

-- Drop policy if exists
drop policy if exists "Public can read published templates" on landing_page_templates;

-- Create policy for public select
create policy "Public can read published templates"
on landing_page_templates
for select
using (is_published = true);
