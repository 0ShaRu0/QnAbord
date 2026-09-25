-- Apply after the initial migration. Also restores a missing question_feed view.
-- Existing deployments must reconcile their migration history before applying.
begin;

create or replace function public.trim_input(value text)
returns text language sql immutable strict set search_path = '' as $$
  select btrim(value, E' \t\n\r\f' || chr(11) || chr(160) || chr(5760)
    || chr(8192) || chr(8193) || chr(8194) || chr(8195) || chr(8196)
    || chr(8197) || chr(8198) || chr(8199) || chr(8200) || chr(8201)
    || chr(8202) || chr(8232) || chr(8233) || chr(8239) || chr(8287)
    || chr(12288) || chr(65279));
$$;

create or replace function public.normalize_tag(value text)
returns text language plpgsql immutable strict set search_path = '' as $$
declare
  result text := public.trim_input(value);
begin
  if char_length(value) > 1024 then
    raise exception using errcode = '22023', message = 'Tag input is too long';
  end if;
  while left(result, 1) = '#' loop
    result := public.trim_input(regexp_replace(result, '^#+', ''));
  end loop;
  return result;
end;
$$;

create or replace function public.normalize_question_tags(tag_names text[])
returns text[] language plpgsql immutable set search_path = '' as $$
declare
  normalized text[];
begin
  if cardinality(coalesce(tag_names, '{}'::text[])) > 100 then
    raise exception using errcode = '22023', message = 'Too many input tags';
  end if;
  select coalesce(array_agg(name order by name), '{}'::text[]) into normalized
  from (
    select distinct public.normalize_tag(value) as name
    from unnest(coalesce(tag_names, '{}'::text[])) as input(value)
  ) tags where name is not null and name <> '';
  if cardinality(normalized) > 5 or exists (select 1 from unnest(normalized) name where char_length(name) > 30) then
    raise exception using errcode = '22023', message = 'Tags must contain at most five names of at most 30 characters';
  end if;
  return normalized;
end;
$$;

-- Normalize duplicate tag identities while retaining every question association.
create temporary table tag_normalization on commit drop as
select id as old_id, min(id) over (partition by normalized_name) as target_id, normalized_name
from (select id, public.normalize_tag(name) as normalized_name from public.tags) t;

do $$ begin
  if exists (select 1 from tag_normalization where normalized_name = '') then
    raise exception 'Empty normalized tags exist. Review these records before applying this migration.';
  end if;
end $$;

insert into public.question_tags(question_id, tag_id)
select distinct qt.question_id, n.target_id from public.question_tags qt
join tag_normalization n on n.old_id = qt.tag_id
on conflict do nothing;
delete from public.question_tags qt using tag_normalization n where qt.tag_id = n.old_id and n.old_id <> n.target_id;
delete from public.tags t using tag_normalization n where t.id = n.old_id and n.old_id <> n.target_id;
update public.tags t set name = n.normalized_name from tag_normalization n where t.id = n.old_id and n.old_id = n.target_id;

do $$ begin
  if exists (select 1 from public.question_tags group by question_id having count(*) > 5) then
    raise exception 'Questions with more than five tags exist. Review these records before applying this migration.';
  end if;
end $$;

alter table public.questions add constraint questions_title_nonblank check (public.trim_input(title) <> '');
alter table public.questions add constraint questions_content_nonblank check (public.trim_input(content) <> '');
alter table public.answers add constraint answers_content_nonblank check (public.trim_input(content) <> '');
alter table public.tags add constraint tags_normalized check (name <> '' and name = public.normalize_tag(name));
alter table public.profiles add constraint profiles_username_nonblank check (public.trim_input(username) <> '');

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, left(coalesce(
    nullif(public.trim_input(new.raw_user_meta_data ->> 'username'), ''),
    nullif(split_part(new.email, '@', 1), ''), '회원'
  ), 20), new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

insert into public.profiles(id, username, avatar_url)
select id, left(coalesce(nullif(public.trim_input(raw_user_meta_data ->> 'username'), ''), nullif(split_part(email, '@', 1), ''), '회원'), 20), raw_user_meta_data ->> 'avatar_url'
from auth.users on conflict (id) do nothing;

-- Derived state: aggregate answers and tags independently to avoid A x T rows.
create or replace view public.question_feed with (security_invoker = true) as
select q.id, q.user_id, q.title, q.content, q.category,
  case when a.answer_count > 0 then 'answered'::public.question_status else 'waiting'::public.question_status end as status,
  q.views, q.created_at, q.updated_at, p.username, p.avatar_url,
  coalesce(a.answer_count, 0)::int as answer_count,
  coalesce(t.tags, '[]'::jsonb) as tags
from public.questions q
join public.profiles p on p.id = q.user_id
left join (select question_id, count(*)::int as answer_count from public.answers group by question_id) a on a.question_id = q.id
left join (
  select qt.question_id, jsonb_agg(t.name order by t.name) as tags
  from public.question_tags qt join public.tags t on t.id = qt.tag_id group by qt.question_id
) t on t.question_id = q.id;

drop trigger if exists answers_sync_question_status on public.answers;
drop function if exists public.sync_question_status();
alter table public.questions drop column if exists status;

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at before update of title, content, category on public.questions
for each row execute function public.set_updated_at();

-- These limits must also hold for direct PostgREST writes, not just our RPCs.
create or replace function public.enforce_question_tag_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.questions where id = new.question_id for update;
  if not exists (select 1 from public.question_tags where question_id = new.question_id and tag_id = new.tag_id)
    and (select count(*) from public.question_tags where question_id = new.question_id) >= 5 then
    raise exception using errcode = '23514', message = 'A question may have at most five tags';
  end if;
  return new;
end;
$$;
create trigger question_tags_limit before insert on public.question_tags
for each row execute function public.enforce_question_tag_limit();

create or replace function public.create_question_with_tags(
  question_title text, question_content text, question_category text, tag_names text[]
)
returns uuid language plpgsql set search_path = '' as $$
declare
  new_question_id uuid;
  tag_name text;
  new_tag_id bigint;
  normalized text[] := public.normalize_question_tags(tag_names);
begin
  insert into public.questions(user_id, title, content, category)
  values (auth.uid(), public.trim_input(question_title), public.trim_input(question_content), question_category::public.question_category)
  returning id into new_question_id;
  foreach tag_name in array normalized loop
    insert into public.tags(name) values (tag_name) on conflict (name) do nothing;
    select id into new_tag_id from public.tags where name = tag_name;
    insert into public.question_tags(question_id, tag_id) values (new_question_id, new_tag_id);
  end loop;
  return new_question_id;
end;
$$;

create or replace function public.update_question_with_tags(
  question_id uuid, question_title text, question_content text, question_category text, tag_names text[]
)
returns void language plpgsql set search_path = '' as $$
declare
  tag_name text;
  new_tag_id bigint;
  normalized text[] := public.normalize_question_tags(tag_names);
begin
  update public.questions
  set title = public.trim_input(question_title), content = public.trim_input(question_content), category = question_category::public.question_category
  where id = question_id and user_id = auth.uid();
  if not found then raise exception using errcode = 'P0002', message = 'Question not found or not owned'; end if;
  delete from public.question_tags where question_tags.question_id = update_question_with_tags.question_id;
  foreach tag_name in array normalized loop
    insert into public.tags(name) values (tag_name) on conflict (name) do nothing;
    select id into new_tag_id from public.tags where name = tag_name;
    insert into public.question_tags(question_id, tag_id) values (update_question_with_tags.question_id, new_tag_id);
  end loop;
end;
$$;

-- Parameterized literal search. '%' and '_' in input are text, not wildcards.
create or replace function public.search_questions(
  search_text text default '', category_filter public.question_category default null,
  status_filter public.question_status default null, sort_by text default 'latest',
  page_number integer default 1, page_size integer default 20
)
returns setof public.question_feed language plpgsql stable set search_path = '' as $$
declare
  pattern text := '%' || replace(replace(replace(coalesce(search_text, ''), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%';
begin
  if page_number is null or page_number not between 1 and 10000
    or page_size is null or page_size not between 1 and 100
    or char_length(coalesce(search_text, '')) > 200
    or sort_by is null or sort_by not in ('latest', 'views', 'answers') then
    raise exception using errcode = '22023', message = 'Invalid search parameters';
  end if;
  return query
  select f.id, f.user_id, f.title, left(f.content, 240), f.category, f.status,
    f.views, f.created_at, f.updated_at, f.username, f.avatar_url, f.answer_count, f.tags
  from public.question_feed f
  where (category_filter is null or f.category = category_filter)
    and (status_filter is null or f.status = status_filter)
    and (coalesce(search_text, '') = '' or f.title ilike pattern escape E'\\' or f.content ilike pattern escape E'\\')
  order by
    case when sort_by = 'latest' then f.created_at end desc,
    case when sort_by = 'views' then f.views end desc,
    case when sort_by = 'answers' then f.answer_count end desc,
    f.id desc
  limit page_size + 1 offset (page_number - 1) * page_size;
end;
$$;

create index if not exists answers_question_created_id_idx on public.answers(question_id, created_at, id);
create index if not exists questions_user_id_idx on public.questions(user_id);
create index if not exists answers_user_id_idx on public.answers(user_id);

-- Remove broad/default grants first: table grants override column restrictions.
revoke all on public.profiles, public.questions, public.answers, public.tags, public.question_tags, public.question_feed from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.questions, public.answers, public.tags, public.question_tags, public.question_feed to anon, authenticated;
grant update(username, avatar_url) on public.profiles to authenticated;
grant insert(user_id, title, content, category), update(title, content, category), delete on public.questions to authenticated;
grant insert(question_id, user_id, content), update(content), delete on public.answers to authenticated;
grant insert(name) on public.tags to authenticated;
grant insert(question_id, tag_id), delete on public.question_tags to authenticated;
revoke all on sequence public.tags_id_seq from public, anon, authenticated;
grant usage on sequence public.tags_id_seq to authenticated;

revoke all on function public.enforce_question_tag_limit() from public, anon, authenticated;
revoke all on function public.trim_input(text), public.normalize_tag(text), public.normalize_question_tags(text[]) from public;
grant execute on function public.trim_input(text), public.normalize_tag(text) to anon, authenticated;
grant execute on function public.normalize_question_tags(text[]) to authenticated;
revoke all on function public.search_questions(text, public.question_category, public.question_status, text, integer, integer) from public;
grant execute on function public.search_questions(text, public.question_category, public.question_status, text, integer, integer) to anon, authenticated;

-- Explicitly preserve the RPC contract if this database had nonstandard defaults.
revoke all on function public.create_question_with_tags(text, text, text, text[]), public.update_question_with_tags(uuid, text, text, text, text[]) from public, anon;
grant execute on function public.create_question_with_tags(text, text, text, text[]), public.update_question_with_tags(uuid, text, text, text, text[]) to authenticated;
revoke all on function public.increment_question_views(uuid) from public;
grant execute on function public.increment_question_views(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
