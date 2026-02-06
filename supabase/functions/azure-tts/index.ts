import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

// "Safe": lire exactement l'arabe fourni.
// "Detailed": micro-pauses autour + entre les mots.
const toDetailedSsmlInner = (text: string) => {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return escapeXml(text ?? "");
  return words.map(escapeXml).join('<break time="120ms"/>');
};

type SsmlMode = "safe" | "detailed";

const buildSsml = (text: string, mode: SsmlMode) => {
  const locale = "ar-SA";
  const voiceName = "ar-SA-HamedNeural";
  const rate = "-10%";
  const pitch = "0%";

  // Important: on force un vrai silence AVANT le <lang> pour casser toute liaison/context phantom.
  // ("dictionary word" behavior)
  // Pas de pause avant - prononciation directe
  const preBreak = '';

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
    const { text, ssmlMode, debug } = await req.json();
    const AZURE_SPEECH_KEY = Deno.env.get("AZURE_SPEECH_KEY");
    const AZURE_SPEECH_REGION = Deno.env.get("AZURE_SPEECH_REGION") || "francecentral";

    if (!AZURE_SPEECH_KEY) {
      throw new Error("AZURE_SPEECH_KEY is not configured");
    }

    if (!text) {
      throw new Error("Text is required");
    }

    const sanitizedText = sanitizeArabic(String(text));
    if (!sanitizedText) {
      throw new Error("Text is required");
    }

    const mode = (String(ssmlMode ?? "safe") as SsmlMode) === "detailed" ? "detailed" : "safe";

    const outputFormat = "audio-24khz-48kbitrate-mono-mp3";
    const payload = buildSsml(sanitizedText, mode);

    // Log demandé: payload exact avant appel API
    console.log(
      JSON.stringify({
        kind: "azure-tts_payload",
        voiceName: payload.voiceName,
        locale: payload.locale,
        outputFormat,
        rate: payload.rate,
        pitch: payload.pitch,
        ssmlMode: mode,
        textOriginal: String(text),
        textSanitized: sanitizedText,
        ssml: payload.ssml,
      })
    );

    // Mode debug: retourner le payload sans appeler Azure.
    if (debug === true) {
      return new Response(
        JSON.stringify({
          ok: true,
          voiceName: payload.voiceName,
          locale: payload.locale,
          outputFormat,
          rate: payload.rate,
          pitch: payload.pitch,
          ssmlMode: mode,
          textSanitized: sanitizedText,
          ssml: payload.ssml,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in azure-tts:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
