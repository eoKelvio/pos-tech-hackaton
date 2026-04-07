import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

interface GenerateOptions {
  provider: string;
  model: string;
  apiKey: string;
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
}

const TIMEOUT_MS = 60_000; // 60 segundos
const MAX_TOKENS = 4096;

/** Cria um AbortSignal que dispara após o timeout */
function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(TIMEOUT_MS);
}

export async function generateText({
  provider,
  model,
  apiKey,
  prompt,
  imageBase64,
  imageMimeType = "image/jpeg",
}: GenerateOptions): Promise<string> {
  switch (provider) {
    case "gemini": {
      const genAI = new GoogleGenerativeAI(apiKey);
      const m = genAI.getGenerativeModel({
        model,
        generationConfig: { maxOutputTokens: MAX_TOKENS },
      });
      if (imageBase64) {
        const result = await m.generateContent(
          [
            { inlineData: { data: imageBase64, mimeType: imageMimeType as "image/jpeg" | "image/png" | "image/webp" } },
            prompt,
          ],
          { signal: timeoutSignal() }
        );
        return result.response.text();
      }
      const result = await m.generateContent(prompt, { signal: timeoutSignal() });
      return result.response.text();
    }

    case "groq": {
      const client = new OpenAI({ apiKey, baseURL: "https://api.groq.com/openai/v1" });
      const completion = await client.chat.completions.create(
        {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: MAX_TOKENS,
        },
        { signal: timeoutSignal() }
      );
      return completion.choices[0].message.content ?? "";
    }

    case "github": {
      const client = new OpenAI({ apiKey, baseURL: "https://models.inference.ai.azure.com" });
      if (imageBase64) {
        const completion = await client.chat.completions.create(
          {
            model,
            messages: [{
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
                { type: "text", text: prompt },
              ],
            }],
            max_tokens: MAX_TOKENS,
          },
          { signal: timeoutSignal() }
        );
        return completion.choices[0].message.content ?? "";
      }
      const completion = await client.chat.completions.create(
        {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: MAX_TOKENS,
        },
        { signal: timeoutSignal() }
      );
      return completion.choices[0].message.content ?? "";
    }

    case "openai": {
      const client = new OpenAI({ apiKey });
      if (imageBase64) {
        const completion = await client.chat.completions.create(
          {
            model,
            messages: [{
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${imageMimeType};base64,${imageBase64}` } },
                { type: "text", text: prompt },
              ],
            }],
            max_tokens: MAX_TOKENS,
          },
          { signal: timeoutSignal() }
        );
        return completion.choices[0].message.content ?? "";
      }
      const completion = await client.chat.completions.create(
        {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: MAX_TOKENS,
        },
        { signal: timeoutSignal() }
      );
      return completion.choices[0].message.content ?? "";
    }

    case "anthropic": {
      const client = new Anthropic({ apiKey });
      if (imageBase64) {
        const message = await client.messages.create(
          {
            model,
            max_tokens: MAX_TOKENS,
            messages: [{
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: imageMimeType as "image/jpeg" | "image/png" | "image/webp", data: imageBase64 },
                },
                { type: "text", text: prompt },
              ],
            }],
          },
          { signal: timeoutSignal() }
        );
        const block = message.content.find((b) => b.type === "text");
        return block && block.type === "text" ? block.text : "";
      }
      const message = await client.messages.create(
        {
          model,
          max_tokens: MAX_TOKENS,
          messages: [{ role: "user", content: prompt }],
        },
        { signal: timeoutSignal() }
      );
      const block = message.content.find((b) => b.type === "text");
      return block && block.type === "text" ? block.text : "";
    }

    default:
      throw new Error(`Provedor desconhecido: ${provider}`);
  }
}
