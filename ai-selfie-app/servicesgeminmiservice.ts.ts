import { GoogleGenAI, Chat } from "@google/genai";

// FIX: Adhere to Gemini API guidelines by using process.env.API_KEY.
// The API key is assumed to be pre-configured and accessible in the execution environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function startChatSession(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are a helpful, bilingual assistant fluent in both Korean and English. You can remember the context of the current conversation.',
    },
  });
}

export const getMimeType = (filename: string): string | null => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        default:
            return null;
    }
}