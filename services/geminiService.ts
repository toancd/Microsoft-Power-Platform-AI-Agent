import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in environment variables.");
}

// Initialize the client once if possible, or per request if config changes significantly.
// However, since system instructions are part of the chat config, we create a new chat instance when config changes.

export const createChatSession = (model: string, systemInstruction: string) => {
  const ai = new GoogleGenAI({ apiKey: apiKey || '' });
  
  const chat: Chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return chat;
};

export const sendMessageStream = async (
  chat: Chat, 
  message: string, 
  onChunk: (text: string) => void
): Promise<string> => {
  let fullText = "";
  
  try {
    const responseStream = await chat.sendMessageStream({ message });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }

  return fullText;
};
