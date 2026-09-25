-- Read-only. Run in the SAME Supabase project used by the failing deployment.
select name, to_regclass('public.' || name) as relation
from unnest(array['profiles', 'questions', 'answers', 'tags', 'question_tags', 'question_feed']) objects(name);

select n.nspname, c.relname, c.relkind, c.reloptions,
  has_table_privilege('anon', c.oid, 'select') as anon_can_read,
  has_table_privilege('authenticated', c.oid, 'select') as member_can_read
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('question_feed', 'questions', 'answers', 'tags', 'question_tags', 'profiles');

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public';

select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where specific_schema = 'public' and routine_name in ('search_questions', 'create_question_with_tags', 'update_question_with_tags', 'increment_question_views');

select u.id as user_without_profile from auth.users u
left join public.profiles p on p.id = u.id where p.id is null;
