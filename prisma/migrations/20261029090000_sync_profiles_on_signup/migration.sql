-- Supabase provides auth.users, but Prisma's temporary shadow database does not.
-- Execute the profile sync only when this migration runs against a Supabase database.
DO $migration$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RAISE NOTICE 'Skipping Supabase Auth profile sync because auth.users is unavailable';
    RETURN;
  END IF;

  EXECUTE $backfill$
    INSERT INTO public.profiles (id, name, gender, created_at, updated_at)
    SELECT
      users.id,
      COALESCE(
        NULLIF(users.raw_user_meta_data ->> 'name', ''),
        SPLIT_PART(users.email, '@', 1),
        'ユーザー'
      ),
      CASE
        WHEN users.raw_user_meta_data ->> 'gender' IN ('男性', '女性', '無回答')
          THEN users.raw_user_meta_data ->> 'gender'
        ELSE '無回答'
      END,
      users.created_at,
      NOW()
    FROM auth.users AS users
    ON CONFLICT (id) DO NOTHING
  $backfill$;

  EXECUTE $function$
    CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $body$
    BEGIN
      INSERT INTO public.profiles (id, name, gender, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(
          NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
          SPLIT_PART(NEW.email, '@', 1),
          'ユーザー'
        ),
        CASE
          WHEN NEW.raw_user_meta_data ->> 'gender' IN ('男性', '女性', '無回答')
            THEN NEW.raw_user_meta_data ->> 'gender'
          ELSE '無回答'
        END,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        gender = EXCLUDED.gender,
        updated_at = NOW();

      RETURN NEW;
    END;
    $body$
  $function$;

  EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
  EXECUTE
    'CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user()';
END;
$migration$;
