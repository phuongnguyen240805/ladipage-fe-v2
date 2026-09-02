-- Separate imported template master artifacts from database editor_data.
-- Native templates may keep editor_data JSONB; imported templates can point to
-- immutable/static artifacts served by CDN / object storage.

alter table landing_page_templates
  alter column editor_data drop not null;

alter table landing_page_templates
  add column if not exists source_type text not null default 'native',
  add column if not exists source_repo text,
  add column if not exists source_ref text,
  add column if not exists manifest_url text,
  add column if not exists editor_data_url text,
  add column if not exists render_url text,
  add column if not exists artifact_version integer,
  add column if not exists content_hash text;

create index if not exists landing_page_templates_source_type_idx
  on landing_page_templates (source_type);

create index if not exists landing_page_templates_content_hash_idx
  on landing_page_templates (content_hash)
  where content_hash is not null;

comment on column landing_page_templates.editor_data is
  'Native template editor tree. Imported templates may keep this NULL and load editor_data_url lazily.';
comment on column landing_page_templates.editor_data_url is
  'Root-relative or absolute URL to compiled editor-data JSON artifact.';
comment on column landing_page_templates.manifest_url is
  'Root-relative or absolute URL to template artifact manifest.';
comment on column landing_page_templates.render_url is
  'Standalone HTML preview/runtime URL for the master template.';
comment on column landing_page_templates.content_hash is
  'SHA-256 of the compiled template editor artifact for version/change detection.';
