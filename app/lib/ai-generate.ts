import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export async function generateText({
  provider,
  model,
  apiKey,
  prompt,
}: {
  provider: string;
  model: string;
  apiKey: string;
  prompt: string;
}): Promise<string> {
  switch (provider) {
    case "gemini": {
      const genAI = new GoogleGenerativeAI(apiKey);
      const m = genAI.getGenerativeModel({ model });
      const result = await m.generateContent(prompt);
      return result.response.text();
    }

    case "groq": {
      const client = new OpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
      });
      return completion.choices[0].message.content ?? "";
    }

    case "github": {
      const client = new OpenAI({
        apiKey,
        baseURL: "https://models.inference.ai.azure.com",
      });
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
      });
      return completion.choices[0].message.content ?? "";
    }

    case "openai": {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
      });
      return completion.choices[0].message.content ?? "";
    }

    case "anthropic": {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });
      const block = message.content.find((b) => b.type === "text");
      return block && block.type === "text" ? block.text : "";
    }

    default:
      throw new Error(`Provedor desconhecido: ${provider}`);
  }
}
