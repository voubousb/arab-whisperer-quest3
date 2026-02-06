-- 1. Corriger la sécurité : Retirer les policies SELECT publiques sur profiles
DROP POLICY IF EXISTS "Public profiles are viewable " ON public.profiles;

-- 2. Créer une vue publique avec seulement les données non sensibles
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker = on)
AS SELECT
    id,
    user_id,
    display_name,
    avatar_url,
    trophies,
    games_played,
    games_won
FROM public.profiles;

-- 3. Autoriser la lecture publique sur la vue
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- 4. Créer la table des clans (persistants, créés par humains)
CREATE TABLE IF NOT EXISTS public.clans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code CHAR(6) NOT NULL UNIQUE,
    avatar_id TEXT NOT NULL DEFAULT 'tree',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clans
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;

-- Policies for clans - tout le monde peut voir les clans
CREATE POLICY "Anyone can view clans"
ON public.clans FOR SELECT
USING (true);

-- Authenticated users can create clans
CREATE POLICY "Authenticated users can create clans"
ON public.clans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 5. Créer la table des membres de clan
CREATE TABLE IF NOT EXISTS public.clan_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(clan_id, user_id)
);

-- Enable RLS on clan_members
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view clan members
CREATE POLICY "Anyone can view clan members"
ON public.clan_members FOR SELECT
USING (true);

-- Authenticated users can join clans
CREATE POLICY "Authenticated users can join clans"
ON public.clan_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can leave clans (delete their own membership)
CREATE POLICY "Users can leave clans"
ON public.clan_members FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Créer la table des messages de clan (persistants)
CREATE TABLE IF NOT EXISTS public.clan_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clan_messages
ALTER TABLE public.clan_messages ENABLE ROW LEVEL SECURITY;

-- Clan members can view messages
CREATE POLICY "Clan members can view messages"
ON public.clan_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.clan_members 
        WHERE clan_members.clan_id = clan_messages.clan_id 
        AND clan_members.user_id = auth.uid()
    )
);

-- Clan members can send messages
CREATE POLICY "Clan members can send messages"
ON public.clan_messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.clan_members 
        WHERE clan_members.clan_id = clan_messages.clan_id 
        AND clan_members.user_id = auth.uid()
    )
);

-- 7. Créer la table du matchmaking en ligne (queue)
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    trophies INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Authenticated users can join/leave queue
CREATE POLICY "Users can view queue"
ON public.matchmaking_queue FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can join queue"
ON public.matchmaking_queue FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave queue"
ON public.matchmaking_queue FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 8. Créer la table des matchs en ligne
CREATE TABLE IF NOT EXISTS public.online_matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    player2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    player1_score INTEGER NOT NULL DEFAULT 0,
    player2_score INTEGER NOT NULL DEFAULT 0,
    current_round INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.online_matches ENABLE ROW LEVEL SECURITY;

-- Players can view their matches
CREATE POLICY "Players can view their matches"
ON public.online_matches FOR SELECT
TO authenticated
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- System/trigger will create matches
CREATE POLICY "Authenticated users can create matches"
ON public.online_matches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Players can update their matches
CREATE POLICY "Players can update their matches"
ON public.online_matches FOR UPDATE
TO authenticated
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable realtime for matchmaking and matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.matchmaking_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.online_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clan_messages;