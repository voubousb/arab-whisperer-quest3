import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Bump this when you deploy changes (helps confirm the running version)
const VERSION = "find-match@2026-02-06-1";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log(`[${VERSION}] ${req.method} request`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Créer client avec service role pour accéder à toutes les entrées de la queue
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer l'utilisateur depuis le token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé", _version: VERSION }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token invalide", _version: VERSION }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Récupérer l'entrée du joueur dans la queue
    const { data: myEntry, error: myEntryError } = await supabase
      .from("matchmaking_queue")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (myEntryError) {
      console.error("Erreur récup entrée:", myEntryError);
      return new Response(JSON.stringify({ error: "Erreur serveur", _version: VERSION }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!myEntry) {
      // Fallback crucial:
      // Si l'autre joueur a déjà créé le match, il supprime ensuite les 2 entrées de queue.
      // Dans ce cas, ce client voit "Pas dans la queue" et reste bloqué en "searching".
      // On vérifie donc s'il existe un match récent impliquant ce user.
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const existing = await getRecentMatchForUser(supabase, userId, fiveMinutesAgo);
      if (existing) {
        return new Response(
          JSON.stringify({
            found: true,
            matchId: existing.id,
            player1Id: existing.player1_id,
            player2Id: existing.player2_id,
            start_at: existing.start_at,
            _version: VERSION,
            _source: "existing_match",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ found: false, message: "Pas dans la queue", _version: VERSION }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const myTrophies = myEntry.trophies || 0;

    // Chercher un adversaire dans la queue (pas soi-même)
    // Critère: trophées similaires (±200) et présent depuis moins de 2 minutes
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const { data: opponents, error: opponentsError } = await supabase
      .from("matchmaking_queue")
      .select("*")
      .neq("user_id", userId)
      .gte("created_at", twoMinutesAgo)
      .gte("trophies", myTrophies - 200)
      .lte("trophies", myTrophies + 200)
      .order("created_at", { ascending: true })
      .limit(1);

    if (opponentsError) {
      console.error("Erreur recherche adversaires:", opponentsError);
      return new Response(JSON.stringify({ error: "Erreur serveur", _version: VERSION }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!opponents || opponents.length === 0) {
      // Pas d'adversaire trouvé, élargir la recherche (tous les trophées)
      const { data: anyOpponent, error: anyError } = await supabase
        .from("matchmaking_queue")
        .select("*")
        .neq("user_id", userId)
        .gte("created_at", twoMinutesAgo)
        .order("created_at", { ascending: true })
        .limit(1);

      if (anyError || !anyOpponent || anyOpponent.length === 0) {
        return new Response(
          JSON.stringify({ found: false, message: "Aucun adversaire disponible", _version: VERSION }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Créer le match avec l'adversaire trouvé
      return await createMatch(supabase, userId, anyOpponent[0].user_id, corsHeaders);
    }

    // Créer le match avec l'adversaire trouvé
    return await createMatch(supabase, userId, opponents[0].user_id, corsHeaders);
  } catch (error) {
    console.error("Erreur find-match:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur", _version: VERSION }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function getRecentMatchForUser(supabase: any, userId: string, sinceIso: string) {
  const { data, error } = await supabase
    .from("online_matches")
    .select("id, player1_id, player2_id, status, created_at, start_at")
    .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
    .gte("created_at", sinceIso)
    .in("status", ["playing", "waiting"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Erreur recherche match existant:", error);
    return null;
  }

  return data?.[0] ?? null;
}

async function createMatch(
  supabase: any,
  player1Id: string,
  player2Id: string,
  corsHeaders: Record<string, string>
) {
  // Anti double-création: si un match récent existe déjà pour cette paire, on le renvoie.
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: existingPair, error: existingPairError } = await supabase
    .from("online_matches")
    .select("id, player1_id, player2_id, status, created_at")
    .or(
      `and(player1_id.eq.${player1Id},player2_id.eq.${player2Id}),and(player1_id.eq.${player2Id},player2_id.eq.${player1Id})`
    )
    .gte("created_at", fiveMinutesAgo)
    .in("status", ["playing", "waiting"])
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingPairError) {
    console.error("Erreur vérif match existant:", existingPairError);
  }

  if (existingPair?.[0]) {
    // Supprimer les deux joueurs de la queue (idempotent)
    await supabase.from("matchmaking_queue").delete().in("user_id", [player1Id, player2Id]);

    return new Response(
      JSON.stringify({
        found: true,
        matchId: existingPair[0].id,
        player1Id: existingPair[0].player1_id,
        player2Id: existingPair[0].player2_id,
        _version: VERSION,
        _source: "existing_pair",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Créer le match
  // Créer le match — inclure un `start_at` dans le futur pour synchroniser les clients
  const startAtIso = new Date(Date.now() + 4000).toISOString(); // démarrage dans ~4s
  const { data: match, error: matchError } = await supabase
    .from("online_matches")
    .insert({
      player1_id: player1Id,
      player2_id: player2Id,
      status: "playing",
      current_round: 1,
      player1_score: 0,
      player2_score: 0,
      start_at: startAtIso,
    })
    .select()
    .single();

  if (matchError) {
    console.error("Erreur création match:", matchError);
    return new Response(JSON.stringify({ error: "Erreur création match", _version: VERSION }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Supprimer les deux joueurs de la queue
  await supabase.from("matchmaking_queue").delete().eq("user_id", player1Id);
  await supabase.from("matchmaking_queue").delete().eq("user_id", player2Id);

  return new Response(
    JSON.stringify({
      found: true,
      matchId: match.id,
      player1Id,
      player2Id,
      start_at: match.start_at,
      _version: VERSION,
      _source: "created",
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

