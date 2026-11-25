-- =====================================================================
--  اختياري: موقع مفتوح بلا كلمة سر
--
--  شغّلي هذا الملف بعد schema.sql فقط إذا قررتم الاستغناء عن تسجيل الدخول.
--  بعده يستطيع أي شخص يعرف رابط الموقع أن يضيف ويعدّل ويحذف،
--  لذلك لا تنشروا الرابط خارج العائلة.
--  وفي ملف الإعداد اجعلي authMode = "open".
--
--  للعودة إلى الوضع المحمي: شغّلي الجزء الأخير (إلغاء الوصول المفتوح).
-- =====================================================================

grant usage on schema public to anon;
grant select                         on public.members, public.sections to anon;
grant select, insert, update, delete on public.categories, public.products, public.product_members to anon;
grant execute on function public.save_product(uuid, jsonb, text[]) to anon;

drop policy if exists "open read members"      on public.members;
drop policy if exists "open read sections"     on public.sections;
drop policy if exists "open manage categories" on public.categories;
drop policy if exists "open manage products"   on public.products;
drop policy if exists "open manage links"      on public.product_members;

create policy "open read members"      on public.members         for select to anon using (true);
create policy "open read sections"     on public.sections        for select to anon using (true);
create policy "open manage categories" on public.categories      for all    to anon using (true) with check (true);
create policy "open manage products"   on public.products        for all    to anon using (true) with check (true);
create policy "open manage links"      on public.product_members for all    to anon using (true) with check (true);

drop policy if exists "open read images"   on storage.objects;
drop policy if exists "open upload images" on storage.objects;
drop policy if exists "open update images" on storage.objects;
drop policy if exists "open delete images" on storage.objects;

create policy "open read images"   on storage.objects for select to anon using (bucket_id = 'product-images');
create policy "open upload images" on storage.objects for insert to anon with check (bucket_id = 'product-images');
create policy "open update images" on storage.objects for update to anon using (bucket_id = 'product-images');
create policy "open delete images" on storage.objects for delete to anon using (bucket_id = 'product-images');


-- ---------------------------------------------------------------------
--  إلغاء الوصول المفتوح (للعودة إلى كلمة سر العائلة)
--  أزيلي علامتي التعليق من الأسطر التالية ثم شغّليها:
-- ---------------------------------------------------------------------
-- drop policy if exists "open read members"      on public.members;
-- drop policy if exists "open read sections"     on public.sections;
-- drop policy if exists "open manage categories" on public.categories;
-- drop policy if exists "open manage products"   on public.products;
-- drop policy if exists "open manage links"      on public.product_members;
-- drop policy if exists "open read images"   on storage.objects;
-- drop policy if exists "open upload images" on storage.objects;
-- drop policy if exists "open update images" on storage.objects;
-- drop policy if exists "open delete images" on storage.objects;
-- revoke execute on function public.save_product(uuid, jsonb, text[]) from anon;
