-- =====================================================================
--  قائمة أمنيات العائلة | Family Christmas Wishlist — الإصدار 2
--  مخطط قاعدة البيانات في Supabase
--
--  انسخي الملف كله والصقيه في: Supabase → SQL Editor → New query → Run
--  • مشروع جديد: ينشئ كل شيء.
--  • شغّلتِ الإصدار الأول من قبل: شغّليه مرة أخرى؛ يضيف قسم المكياج،
--    ويحدّث تصنيفات الصيدلية، وينقل ما كان في تصنيف «المكياج» داخل
--    الصيدلية إلى قسم المكياج الجديد. لا يحذف أي منتج.
--
--  الوضع الافتراضي: الوصول لأفراد العائلة فقط بعد الدخول بكلمة سر العائلة.
--  للموقع المفتوح بلا كلمة سر: شغّلي open-access.sql بعد هذا الملف.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) الجداول
-- ---------------------------------------------------------------------

-- أفراد العائلة
create table if not exists public.members (
  id          text primary key,                 -- معرّف قصير ثابت، مثل raghad
  name        text not null,
  gender      text not null default 'f' check (gender in ('f', 'm')),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- الأقسام الرئيسية
create table if not exists public.sections (
  id          text primary key,
  name        text not null,
  sort_order  int  not null default 0
);

-- التصنيفات داخل كل قسم (تُضاف غيرها من داخل الموقع)
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  section_id  text not null references public.sections(id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  sort_order  int  not null default 100,
  created_at  timestamptz not null default now(),
  unique (section_id, name)
);

-- المنتجات: الاسم، والوصف، والصورة، وحالة الشراء
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  section_id    text not null references public.sections(id),
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null check (char_length(btrim(name)) between 1 and 200),
  description   text,
  image_path    text,                            -- مسار الصورة داخل Storage
  is_shared     boolean not null default false,  -- منتج مشترك بين أكثر من شخص
  purchased     boolean not null default false,
  purchased_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- علاقة المنتج بالأشخاص (منتج فردي = شخص واحد، منتج مشترك = عدة أشخاص)
create table if not exists public.product_members (
  product_id  uuid not null references public.products(id) on delete cascade,
  member_id   text not null references public.members(id) on delete cascade,
  primary key (product_id, member_id)
);

create index if not exists product_members_member_idx on public.product_members (member_id);
create index if not exists products_section_idx       on public.products (section_id);
create index if not exists products_category_idx      on public.products (category_id);
create index if not exists categories_section_idx     on public.categories (section_id);


-- ---------------------------------------------------------------------
-- 2) تحديث updated_at تلقائيًا
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
-- 3) حفظ منتج مع أصحابه في عملية واحدة (إضافة أو تعديل)
--    security invoker: تُطبَّق سياسات RLS على من يستدعي الدالة.
-- ---------------------------------------------------------------------
create or replace function public.save_product(
  p_id          uuid,
  p_data        jsonb,
  p_member_ids  text[]
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id      uuid;
  v_count   int := coalesce(array_length(p_member_ids, 1), 0);
  v_shared  boolean;
begin
  if v_count = 0 then
    raise exception 'member_required' using hint = 'اختاري شخصًا واحدًا على الأقل';
  end if;

  v_shared := coalesce((p_data ->> 'is_shared')::boolean, false) or v_count > 1;

  if p_id is null then
    insert into products (section_id, category_id, name, description, image_path, is_shared)
    values (
      p_data ->> 'section_id',
      nullif(p_data ->> 'category_id', '')::uuid,
      btrim(p_data ->> 'name'),
      nullif(btrim(coalesce(p_data ->> 'description', '')), ''),
      nullif(p_data ->> 'image_path', ''),
      v_shared
    )
    returning id into v_id;
  else
    update products set
      section_id  = p_data ->> 'section_id',
      category_id = nullif(p_data ->> 'category_id', '')::uuid,
      name        = btrim(p_data ->> 'name'),
      description = nullif(btrim(coalesce(p_data ->> 'description', '')), ''),
      image_path  = nullif(p_data ->> 'image_path', ''),
      is_shared   = v_shared
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'product_not_found';
    end if;
  end if;

  delete from product_members
   where product_id = v_id
     and member_id <> all (p_member_ids);

  insert into product_members (product_id, member_id)
  select v_id, m from unnest(p_member_ids) as m
  on conflict do nothing;

  return v_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 4) البيانات الأساسية (لا توجد أي منتجات تجريبية)
-- ---------------------------------------------------------------------
insert into public.members (id, name, gender, sort_order) values
  ('raghad', 'رغد',   'f', 1),
  ('lina',   'لينا',  'f', 2),
  ('aleen',  'ألين',  'f', 3),
  ('afaf',   'عفاف',  'f', 4),
  ('adel',   'عادل',  'm', 5),
  ('salman', 'سلمان', 'm', 6),
  ('rawan',  'روان',  'f', 7),
  ('naif',   'نايف',  'm', 8),
  ('lamar',  'لمار',  'f', 9)
on conflict (id) do nothing;

insert into public.sections (id, name, sort_order) values
  ('pharmacy', 'الصيدلية',     1),
  ('makeup',   'المكياج',      2),
  ('perfumes', 'العطور',       3),
  ('bags',     'الشنط',        4),
  ('fashion',  'الملابس',      5),
  ('gifts',    'الإكسسوارات', 6),
  ('toys',     'الألعاب',     7)
on conflict (id) do update
  set name = excluded.name, sort_order = excluded.sort_order;

-- ترقية من الإصدار الأول: اسم التصنيف الجديد
update public.categories c
   set name = 'التصبغات وتوحيد اللون'
 where c.section_id = 'pharmacy'
   and c.name = 'علاج التصبغات وتوحيد اللون'
   and not exists (select 1 from public.categories x where x.section_id = 'pharmacy' and x.name = 'التصبغات وتوحيد اللون');

insert into public.categories (section_id, name, sort_order) values
  ('pharmacy', 'العناية بالوجه',            1),
  ('pharmacy', 'التصبغات وتوحيد اللون',     2),
  ('pharmacy', 'الهالات والعناية بالعين',   3),
  ('pharmacy', 'العناية بالجسم',            4),
  ('pharmacy', 'العناية بالشعر',            5),
  ('pharmacy', 'الرموش والحواجب',           6),
  ('pharmacy', 'الأظافر',                   7),
  ('pharmacy', 'الأسنان والفم',             8),
  ('pharmacy', 'المكملات والفيتامينات',     9),
  ('pharmacy', 'منتجات أخرى',               999),
  ('makeup',   'الوجه',                     1),
  ('makeup',   'العيون',                    2),
  ('makeup',   'الشفاه',                    3),
  ('makeup',   'الحواجب',                   4),
  ('makeup',   'الفرش والأدوات',            5),
  ('makeup',   'منتجات أخرى',               999)
on conflict (section_id, name) do update set sort_order = excluded.sort_order;

-- ترقية من الإصدار الأول: نقل منتجات «المكياج» من الصيدلية إلى قسم المكياج
update public.products p
   set section_id  = 'makeup',
       category_id = (select id from public.categories where section_id = 'makeup' and name = 'منتجات أخرى')
 where p.category_id in (select id from public.categories where section_id = 'pharmacy' and name = 'المكياج');

delete from public.categories where section_id = 'pharmacy' and name = 'المكياج';

-- ترقية: حذف تصنيفَي «المناطق الحساسة» و«العناية الشخصية» من الصيدلية،
-- وما فيهما من منتجات ينتقل إلى «منتجات أخرى» في الصيدلية نفسها.
update public.products p
   set category_id = (select id from public.categories where section_id = 'pharmacy' and name = 'منتجات أخرى')
 where p.category_id in (select id from public.categories where section_id = 'pharmacy' and name in ('المناطق الحساسة', 'العناية الشخصية'));

delete from public.categories where section_id = 'pharmacy' and name in ('المناطق الحساسة', 'العناية الشخصية');

-- التصنيفات في الصيدلية والمكياج فقط: منتجات بقية الأقسام تبقى كما هي وتُفصل عن أي تصنيف
update public.products set category_id = null
 where category_id is not null and section_id not in ('pharmacy', 'makeup');
delete from public.categories where section_id not in ('pharmacy', 'makeup');


-- ---------------------------------------------------------------------
-- 5) الصلاحيات وأمان الصفوف (RLS)
-- ---------------------------------------------------------------------
alter table public.members         enable row level security;
alter table public.sections        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_members enable row level security;

grant usage on schema public to authenticated;
grant select                         on public.members, public.sections to authenticated;
grant select, insert, update, delete on public.categories, public.products, public.product_members to authenticated;

revoke execute on function public.save_product(uuid, jsonb, text[]) from public, anon;
grant  execute on function public.save_product(uuid, jsonb, text[]) to authenticated;

drop policy if exists "family read members"      on public.members;
drop policy if exists "family read sections"     on public.sections;
drop policy if exists "family manage categories" on public.categories;
drop policy if exists "family manage products"   on public.products;
drop policy if exists "family manage links"      on public.product_members;

create policy "family read members"      on public.members         for select to authenticated using (true);
create policy "family read sections"     on public.sections        for select to authenticated using (true);
create policy "family manage categories" on public.categories      for all    to authenticated using (true) with check (true);
create policy "family manage products"   on public.products        for all    to authenticated using (true) with check (true);
create policy "family manage links"      on public.product_members for all    to authenticated using (true) with check (true);


-- ---------------------------------------------------------------------
-- 6) تخزين الصور (Storage)
--    حاوية عامة للقراءة بأسماء ملفات عشوائية؛ الرفع والحذف لأفراد العائلة فقط.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "family read images"   on storage.objects;
drop policy if exists "family upload images" on storage.objects;
drop policy if exists "family update images" on storage.objects;
drop policy if exists "family delete images" on storage.objects;

create policy "family read images"   on storage.objects for select to authenticated using (bucket_id = 'product-images');
create policy "family upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "family update images" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "family delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');


-- ---------------------------------------------------------------------
-- 7) المزامنة اللحظية (Realtime)
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  foreach t in array array['products', 'product_members', 'categories'] loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

-- انتهى
