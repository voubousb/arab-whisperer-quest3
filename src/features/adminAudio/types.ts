export type SsmlMode = "safe" | "detailed";

export type AudioDebugPayload = {
  voiceName: string;
  locale: string;
  outputFormat: string;
  rate: string;
  pitch: string;
  ssmlMode: SsmlMode;
  textOriginal: string;
  textSanitized: string;
  ssml: string;
};

export interface AudioItem {
  id: number;
  arabic: string;
  ttsText: string;
  audioKey: string;
  exists: boolean;
  generating: boolean;
  error?: string;
  publicUrl?: string;
  debug?: AudioDebugPayload;
}
