-- حذف التصنيفات من كل الأقسام عدا الصيدلية والمكياج (المنتجات نفسها لا تُحذف)
update public.products set category_id = null
 where category_id is not null and section_id not in ('pharmacy', 'makeup');

delete from public.categories
 where section_id not in ('pharmacy', 'makeup');
