import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sanitizeArabic = (input: string) =>
  (input ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\u0640/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const escapeXml = (unsafe: string) =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDetailedSsmlInner = (text: string) => {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return escapeXml(text ?? "");
  return words.map(escapeXml).join('<break time="120ms"/>');
};

type SsmlMode = "safe" | "detailed";

const buildSsml = (text: string, mode: SsmlMode, voice = "ar-SA-HamedNeural") => {
  const locale = "ar-SA";
  const voiceName = voice;
  const rate = "-10%";
  const pitch = "0%";

  // Important: on force un vrai silence AVANT le <lang> pour casser toute liaison/context phantom.
  const preBreak = '<break time="350ms"/>';

  const inner =
    mode === "detailed"
      ? `${preBreak}<lang xml:lang="${locale}">${toDetailedSsmlInner(text)}</lang><break time="120ms"/>`
      : `${preBreak}<lang xml:lang="${locale}">${escapeXml(text)}</lang>`;

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
      <voice name="${voiceName}">
        <prosody rate="${rate}" pitch="${pitch}">
          ${inner}
        </prosody>
      </voice>
    </speak>
  `.trim();

  return { ssml, locale, voiceName, rate, pitch };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, audioKey, adminPassword, ssmlMode, voiceName: customVoice, debug } = await req.json();
    const AZURE_SPEECH_KEY = Deno.env.get("AZURE_SPEECH_KEY");
    const AZURE_SPEECH_REGION = Deno.env.get("AZURE_SPEECH_REGION") || "francecentral";
    const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!AZURE_SPEECH_KEY) {
      throw new Error("AZURE_SPEECH_KEY is not configured");
    }

    if (!ADMIN_PASSWORD || adminPassword !== ADMIN_PASSWORD) {
      throw new Error("Unauthorized");
    }

    if (!text || !audioKey) {
      throw new Error("Text and audioKey are required");
    }

    const sanitizedText = sanitizeArabic(String(text));
    if (!sanitizedText) {
      throw new Error("Text is required");
    }

    const mode = (String(ssmlMode ?? "safe") as SsmlMode) === "detailed" ? "detailed" : "safe";
    const outputFormat = "audio-24khz-48kbitrate-mono-mp3";
    const voice = typeof customVoice === "string" && customVoice.startsWith("ar-") ? customVoice : "ar-SA-HamedNeural";

    const payload = buildSsml(sanitizedText, mode, voice);

    // Log demandé: payload exact avant appel API
    console.log(
      JSON.stringify({
        kind: "generate-audio_payload",
        voiceName: payload.voiceName,
        locale: payload.locale,
        outputFormat,
        rate: payload.rate,
        pitch: payload.pitch,
        ssmlMode: mode,
        audioKey,
        textOriginal: String(text),
        textSanitized: sanitizedText,
        ssml: payload.ssml,
      })
    );

    const endpoint = `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": outputFormat,
        "User-Agent": "ArabFacile-TTS",
      },
      body: payload.ssml,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure TTS error:", response.status, errorText);
      throw new Error(`Azure TTS error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Upload vers Supabase Storage
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    const { error: uploadError } = await supabase.storage
      .from("arabic-audio")
      .upload(audioKey, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true, // Remplacer si existe déjà
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    // Récupérer l'URL publique
    const { data: publicUrl } = supabase.storage
      .from("arabic-audio")
      .getPublicUrl(audioKey);

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioKey,
        publicUrl: publicUrl.publicUrl,
        ...(debug
          ? {
              debug: {
                voiceName: payload.voiceName,
                locale: payload.locale,
                outputFormat,
                rate: payload.rate,
                pitch: payload.pitch,
                ssmlMode: mode,
                textOriginal: String(text),
                textSanitized: sanitizedText,
                ssml: payload.ssml,
              },
            }
          : {}),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in generate-audio:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
