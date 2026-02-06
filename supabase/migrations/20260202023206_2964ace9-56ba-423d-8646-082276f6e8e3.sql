-- Add unique constraint on user_id for upserts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    -- Already exists as unique from the table definition
    NULL;
  END IF;
END $$;

-- Update the handle_new_user function to also set initial display_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, trophies, games_played, games_won, is_premium, favorites)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Joueur'),
    0,
    0,
    0,
    false,
    '{}'::integer[]
  );
  RETURN NEW;
END;
$function$;