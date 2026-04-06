import fs from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

export const PROVIDER_ENV_KEYS: Record<string, string> = {
  gemini: "GEMINI_API_KEY",
  groq: "GROQ_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  github: "GITHUB_TOKEN",
  openai: "OPENAI_API_KEY",
};

function readEnvFile(): Record<string, string> {
  try {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const result: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      result[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
    return result;
  } catch {
    return {};
  }
}

function writeEnvFile(vars: Record<string, string>) {
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  fs.writeFileSync(ENV_PATH, lines.length ? lines.join("\n") + "\n" : "");
}

export function writeEnvKey(envKey: string, value: string) {
  const vars = readEnvFile();
  vars[envKey] = value;
  writeEnvFile(vars);
}

export function removeEnvKey(envKey: string) {
  const vars = readEnvFile();
  delete vars[envKey];
  writeEnvFile(vars);
}

export function getApiKeyForProvider(provider: string): string {
  const envKey = PROVIDER_ENV_KEYS[provider];
  if (!envKey) return "";
  const vars = readEnvFile();
  return vars[envKey] ?? process.env[envKey] ?? "";
}

export function getConfiguredEnvProviders(): Record<string, boolean> {
  const vars = readEnvFile();
  const result: Record<string, boolean> = {};
  for (const [providerId, envKey] of Object.entries(PROVIDER_ENV_KEYS)) {
    result[providerId] = !!(vars[envKey] || process.env[envKey]);
  }
  return result;
}
