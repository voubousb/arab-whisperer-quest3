import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");

    if (!ADMIN_PASSWORD) {
      throw new Error("ADMIN_PASSWORD is not configured");
    }

    const provided = String(password ?? "").trim();
    if (!provided) {
      return new Response(JSON.stringify({ ok: false, error: "Password is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ok = provided === ADMIN_PASSWORD;
    return new Response(JSON.stringify({ ok }), {
      status: ok ? 200 : 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in admin-auth:", errorMessage);
    return new Response(JSON.stringify({ ok: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
