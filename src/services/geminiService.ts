import { Scene, ReferenceCharacter } from "../types";
import { getCurrentUser } from "./.";
import { apiFetch } from "./api";

export const generateScript = async (
  topic: string,
  style: string,
  language: string = 'English',
  config: { minDuration: number; maxDuration: number; targetScenes?: number } = { minDuration: 55, maxDuration: 65 },
  options?: { personaId?: string; channelId?: string }
): Promise<{
  scenes: Scene[];
  metadata: {
    title: string;
    description: string;
    shortsHashtags: string[];
    tiktokText: string;
    tiktokHashtags: string[];
  }
}> => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const data = await apiFetch('/ai/generate-script', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      topic,
      style,
      language,
      durationConfig: { min: config.minDuration, max: config.maxDuration, targetScenes: config.targetScenes },
      apiKeys: user.apiKeys,
      personaId: options?.personaId,
      channelId: options?.channelId
    })
  });

  // Backend now guarantees standardized camelCase format
  return {
    scenes: data.scenes,
    metadata: {
      title: data.videoTitle,
      description: data.videoDescription,
      shortsHashtags: data.shortsHashtags || [],
      tiktokText: data.tiktokText || "",
      tiktokHashtags: data.tiktokHashtags || [],
    }
  };
};

export const generateMusicPrompt = async (topic: string, style: string): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const data = await apiFetch('/ai/generate-music-prompt', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      topic,
      style,
      apiKeys: user.apiKeys
    })
  });

  return data.prompt;
};

export const analyzeCharacterFeatures = async (base64Image: string): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const data = await apiFetch('/ai/analyze-character', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      image: base64Image,
      apiKeys: user.apiKeys
    })
  });

  return data.result;
};

export const optimizeReferenceImage = async (base64ImageUrl: string): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const data = await apiFetch('/ai/optimize-image', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      image: base64ImageUrl,
      apiKeys: user.apiKeys
    })
  });

  return data.result;
};

export const generatePreviewAudio = async (text: string, voice: string, provider: 'gemini' | 'elevenlabs' | 'groq' = 'gemini'): Promise<string> => {
  const user = getCurrentUser();
  if (!user) throw new Error("User not authenticated");

  const data = await apiFetch('/ai/generate-audio', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      text,
      voice,
      provider,
      apiKeys: user.apiKeys
    })
  });

  return data.audioUrl;
};

export const getVoices = async (): Promise<any[]> => {
  const user = getCurrentUser();
  if (!user) return [];

  try {
    const data = await apiFetch('/ai/voices', {
      method: 'POST',
      body: JSON.stringify({
        apiKeys: user.apiKeys
      })
    });
    return data.voices || [];
  } catch (e) {
    console.warn("Failed to fetch voices");
    return [];
  }
};
