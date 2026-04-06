export interface ModelOption {
  id: string;
  name: string;
}

export interface Provider {
  id: string;
  name: string;
  description: string;
  keyPlaceholder: string;
  keyHint: string;
  models: ModelOption[];
}

export const PROVIDERS: Provider[] = [
  {
    id: "groq",
    name: "Groq",
    description: "Inferência ultra-rápida · tier gratuito generoso (14.400 req/dia)",
    keyPlaceholder: "gsk_...",
    keyHint: "Crie sua chave em console.groq.com",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
      { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (mais rápido)" },
      { id: "llama3-70b-8192", name: "Llama 3 70B" },
      { id: "llama3-8b-8192", name: "Llama 3 8B" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B" },
      { id: "qwen-qwq-32b", name: "Qwen QwQ 32B" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 70B" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude — raciocínio avançado e respostas longas",
    keyPlaceholder: "sk-ant-...",
    keyHint: "Crie sua chave em console.anthropic.com",
    models: [
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 (rápido)" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
      { id: "claude-opus-4-6", name: "Claude Opus 4.6 (mais capaz)" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Modelos Google · tier gratuito disponível",
    keyPlaceholder: "AIza...",
    keyHint: "Crie sua chave em aistudio.google.com — verifique o ID exato do modelo no AI Studio",
    models: [
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro (preview)" },
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (preview)" },
      { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite (preview)" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
      { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
      { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash 8B" },
    ],
  },
  {
    id: "github",
    name: "GitHub Models",
    description: "Acesso gratuito com conta GitHub",
    keyPlaceholder: "ghp_...",
    keyHint: "Crie um Personal Access Token em github.com/settings/tokens",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o mini" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 mini" },
      { id: "gpt-4.1", name: "GPT-4.1" },
      { id: "o1-mini", name: "o1 mini" },
      { id: "o3-mini", name: "o3 mini" },
      { id: "Meta-Llama-3.3-70B-Instruct", name: "Llama 3.3 70B" },
      { id: "Meta-Llama-3.1-405B-Instruct", name: "Llama 3.1 405B" },
      { id: "Mistral-large", name: "Mistral Large" },
      { id: "Mistral-small", name: "Mistral Small" },
      { id: "Phi-4", name: "Phi-4" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4o, o1, o3 e outros modelos OpenAI",
    keyPlaceholder: "sk-...",
    keyHint: "Crie sua chave em platform.openai.com/api-keys",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o mini" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4.1-nano", name: "GPT-4.1 nano" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 mini" },
      { id: "gpt-4.1", name: "GPT-4.1" },
      { id: "o1-mini", name: "o1 mini" },
      { id: "o3-mini", name: "o3 mini" },
    ],
  },
];

// stored in localStorage as "aiConfigs" — boolean flags only (actual keys are in .env.local)
export type AIConfigs = Record<string, boolean>; // providerId -> configured?

export interface AIConfig {
  provider: string;
  model: string;
}

export function getAIConfigs(): AIConfigs {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem("aiConfigs") || "{}");
    // migrate old format: { providerId: "sk-key..." } or { providerId: { apiKey } } → { providerId: true }
    const result: AIConfigs = {};
    for (const [k, v] of Object.entries(raw)) {
      result[k] = typeof v === "boolean" ? v : Boolean(v);
    }
    return result;
  } catch { return {}; }
}

export function markProviderConfigured(providerId: string) {
  const all = getAIConfigs();
  all[providerId] = true;
  localStorage.setItem("aiConfigs", JSON.stringify(all));
}

export function unmarkProviderConfigured(providerId: string) {
  const all = getAIConfigs();
  delete all[providerId];
  localStorage.setItem("aiConfigs", JSON.stringify(all));
}

export function getConfiguredProviders(): { provider: Provider }[] {
  const all = getAIConfigs();
  return PROVIDERS.filter((p) => all[p.id]).map((p) => ({ provider: p }));
}
