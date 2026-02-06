-- Previous migration failed with: ERROR: 42710: relation "clan_messages" is already member of publication "supabase_realtime"
-- Re-run safely with guards.

-- 1) Fix clans.code type (currently char(1))
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'clans'
      AND column_name = 'code'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.clans
      ALTER COLUMN code TYPE text USING trim(code)::text;
  END IF;
END $$;

-- 2) Constraints for 6-letter uppercase codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clans_code_len_6'
      AND conrelid = 'public.clans'::regclass
  ) THEN
    ALTER TABLE public.clans
      ADD CONSTRAINT clans_code_len_6 CHECK (char_length(code) = 6);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clans_code_upper'
      AND conrelid = 'public.clans'::regclass
  ) THEN
    ALTER TABLE public.clans
      ADD CONSTRAINT clans_code_upper CHECK (code = upper(code));
  END IF;
END $$;

-- 3) Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_clans_code_unique ON public.clans (code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clan_members_unique ON public.clan_members (clan_id, user_id);

-- 4) Realtime publication guards
DO $$
DECLARE
  pub_oid oid;
BEGIN
  SELECT oid INTO pub_oid FROM pg_publication WHERE pubname = 'supabase_realtime';

  IF pub_oid IS NULL THEN
    RAISE EXCEPTION 'Publication supabase_realtime not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel
    WHERE prpubid = pub_oid AND prrelid = 'public.clan_messages'::regclass
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel
    WHERE prpubid = pub_oid AND prrelid = 'public.online_matches'::regclass
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.online_matches;
  END IF;
END $$;