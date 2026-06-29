-- ============================================================
-- Migration: Landing Page Security (Draft/Private)
-- Ngày: 2026-06-22
-- Mục tiêu:
--   1. Thêm cột visibility + published_at cho landing_pages
--   2. Bật RLS cho landing_pages và landing_page_versions
--   3. Tạo chính sách RLS nghiêm ngặt:
--      - Owner có toàn quyền với page của mình
--      - Public chỉ đọc được page đã published + visibility='public'
--      - landing_page_versions chỉ owner mới đọc/ghi
-- ============================================================

-- 1. Thêm cột visibility (private/public)
alter table landing_pages
  add column if not exists visibility text not null default 'private';

-- 2. Thêm cột published_at
alter table landing_pages
  add column if not exists published_at timestamptz;

-- 3. Đảm bảo status mặc định là 'draft'
alter table landing_pages
  alter column status set default 'draft';

-- 4. Bật RLS cho landing_pages
alter table landing_pages enable row level security;

-- 5. Xóa các policy cũ nếu tồn tại
drop policy if exists "owner can select own landing pages"    on landing_pages;
drop policy if exists "owner can insert landing pages"        on landing_pages;
drop policy if exists "owner can update own landing pages"    on landing_pages;
drop policy if exists "owner can delete own landing pages"    on landing_pages;
drop policy if exists "public can read published landing pages" on landing_pages;
-- Xóa các policy cũ có thể đã cho phép anon đọc tất cả
drop policy if exists "anon can read all pages"               on landing_pages;
drop policy if exists "allow read for all"                    on landing_pages;
drop policy if exists "allow select for all"                  on landing_pages;
drop policy if exists "Enable read access for all users"      on landing_pages;

-- 6. Tạo policy: Owner có toàn quyền với page của mình
create policy "owner can select own landing pages"
  on landing_pages
  for select
  using (auth.uid() = user_id);

create policy "owner can insert landing pages"
  on landing_pages
  for insert
  with check (auth.uid() = user_id);

create policy "owner can update own landing pages"
  on landing_pages
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "owner can delete own landing pages"
  on landing_pages
  for delete
  using (auth.uid() = user_id);

-- 7. Policy: Public chỉ đọc được page đã published + public
create policy "public can read published landing pages"
  on landing_pages
  for select
  using (
    status = 'published'
    and visibility = 'public'
  );

-- ============================================================
-- landing_page_versions: chỉ owner mới quản lý
-- ============================================================

-- 8. Bật RLS cho landing_page_versions
alter table landing_page_versions enable row level security;

-- 9. Xóa policy cũ
drop policy if exists "owner can manage landing page versions" on landing_page_versions;
drop policy if exists "anon can read all versions"             on landing_page_versions;
drop policy if exists "Enable read access for all users"       on landing_page_versions;

-- 10. Tạo policy: Chỉ owner của page mới có toàn quyền với versions
create policy "owner can manage landing page versions"
  on landing_page_versions
  for all
  using (
    exists (
      select 1
      from landing_pages
      where landing_pages.id = landing_page_versions.page_id
        and landing_pages.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from landing_pages
      where landing_pages.id = landing_page_versions.page_id
        and landing_pages.user_id = auth.uid()
    )
  );

-- ============================================================
-- Cập nhật dữ liệu hiện có: Đồng bộ visibility với status
-- ============================================================

-- Các page đang published thì set visibility = 'public'
update landing_pages
  set visibility = 'public'
  where status = 'published' and visibility = 'private';

-- Các page draft/archived thì set visibility = 'private' (đã là default, nhưng cho chắc)
update landing_pages
  set visibility = 'private'
  where status != 'published' and visibility = 'public';
