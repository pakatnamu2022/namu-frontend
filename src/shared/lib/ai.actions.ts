import { api } from "@/core/api";

const AI_ENDPOINT = "/ai/generate-text";

interface GenerateTextResponse {
  text: string;
  model: string;
  finish_reason: string;
  usage: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export async function generateText(prompt: string): Promise<string> {
  const { data } = await api.post<GenerateTextResponse>(AI_ENDPOINT, { prompt });
  return data.text;
}
