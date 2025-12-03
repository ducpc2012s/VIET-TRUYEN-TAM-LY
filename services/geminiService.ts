
import { GoogleGenAI, Chat, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let aiInstance: GoogleGenAI | null = null;
// Global fallback session (legacy support)
let globalChatSession: Chat | null = null;

export const initializeGemini = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  aiInstance = new GoogleGenAI({ apiKey });
};

export const startNewEpicChat = (customSystemInstruction?: string, customApiKey?: string, modelName: string = 'gemini-3-pro-preview'): Chat => {
  let currentAiInstance = aiInstance;

  // If a custom key is provided, create a specific instance for this session
  if (customApiKey && customApiKey.trim() !== "") {
    currentAiInstance = new GoogleGenAI({ apiKey: customApiKey.trim() });
  } else {
    // Fallback to global instance
    if (!aiInstance) initializeGemini();
    currentAiInstance = aiInstance;
  }

  if (!currentAiInstance) throw new Error("Failed to initialize Gemini.");

  // Use the provided model name, default to gemini-3-pro-preview if undefined
  // Updated maxOutputTokens to 65536 to support massive single-pass generation.
  // Added thinkingConfig for gemini-3-pro-preview to enhance coherence and depth (User Requirement: "Analyze and Think").
  const isThinkingModel = modelName.includes('gemini-3-pro');

  const session = currentAiInstance.chats.create({
    model: modelName, 
    config: {
      systemInstruction: customSystemInstruction || SYSTEM_INSTRUCTION,
      temperature: 0.9, // High creativity
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 65536,
      // Allocate a budget for thinking if using Pro model to ensure high quality analysis of the "Epic Arc"
      ...(isThinkingModel ? { thinkingConfig: { thinkingBudget: 4096 } } : {}),
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    },
  });
  
  globalChatSession = session;
  return session;
};

export const streamEpicContent = async (
  input: string, 
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  chatSessionInstance?: Chat | null
): Promise<string> => {
  // Use provided session or fall back to global
  const session = chatSessionInstance || globalChatSession;

  if (!session) {
    // If no session exists, try to start a default one (fallback)
    startNewEpicChat(); 
    if (!globalChatSession) throw new Error("Chat session not active");
  }

  const activeSession = session || globalChatSession!;

  let fullResponse = "";
  
  try {
    const result = await activeSession.sendMessageStream({
      message: input
    });

    for await (const chunk of result) {
      if (signal?.aborted) {
        break;
      }
      const responseChunk = chunk as GenerateContentResponse;
      const text = responseChunk.text;
      if (text) {
        fullResponse += text;
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }

  return fullResponse;
};

export const resetSession = () => {
  globalChatSession = null;
};
