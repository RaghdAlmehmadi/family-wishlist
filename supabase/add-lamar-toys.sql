-- إضافة لمار وقسم الألعاب (آمن: لا يحذف ولا يغيّر أي منتج)
insert into public.members (id, name, gender, sort_order)
values ('lamar', 'لمار', 'f', 9)
on conflict (id) do nothing;

insert into public.sections (id, name, sort_order)
values ('toys', 'الألعاب', 7)
on conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;

-- لمار تنضم إلى المنتجات المشتركة بين العائلة كلها
insert into public.product_members (product_id, member_id)
select pm.product_id, 'lamar'
from public.product_members pm
join public.products p on p.id = pm.product_id
where p.is_shared and pm.member_id <> 'lamar'
group by pm.product_id
having count(*) = (select count(*) from public.members where id <> 'lamar')
on conflict do nothing;
