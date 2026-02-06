-- Sécuriser la file de matchmaking : accès restreint à l'utilisateur lui-même
DROP POLICY IF EXISTS "Users can view queue" ON public.matchmaking_queue;

CREATE POLICY "Users can only see their own queue entry"
ON public.matchmaking_queue FOR SELECT
TO authenticated
USING (auth.uid() = user_id);