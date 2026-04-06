import { NextRequest, NextResponse } from "next/server";
import {
  writeEnvKey,
  removeEnvKey,
  getApiKeyForProvider,
  getConfiguredEnvProviders,
  PROVIDER_ENV_KEYS,
} from "@/app/lib/env-keys";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  const reveal = searchParams.get("reveal") === "true";

  if (provider && reveal) {
    const apiKey = getApiKeyForProvider(provider);
    return NextResponse.json({ apiKey });
  }

  return NextResponse.json({ configured: getConfiguredEnvProviders() });
}

export async function POST(req: NextRequest) {
  const { provider, apiKey } = await req.json();
  const envKey = PROVIDER_ENV_KEYS[provider];
  if (!envKey) return NextResponse.json({ error: "Provedor desconhecido." }, { status: 400 });
  if (!apiKey?.trim()) return NextResponse.json({ error: "Chave de API obrigatória." }, { status: 400 });
  writeEnvKey(envKey, apiKey.trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { provider } = await req.json();
  const envKey = PROVIDER_ENV_KEYS[provider];
  if (!envKey) return NextResponse.json({ error: "Provedor desconhecido." }, { status: 400 });
  removeEnvKey(envKey);
  return NextResponse.json({ ok: true });
}
