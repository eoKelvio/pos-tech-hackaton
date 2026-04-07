import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provedor e chave são obrigatórios." }, { status: 400 });
    }

    const prompt = "Responda apenas: ok";

    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      if (res.status === 400 || res.status === 403) return NextResponse.json({ error: "Chave inválida." }, { status: 401 });
      if (!res.ok) return NextResponse.json({ error: `Erro ao validar: ${res.statusText}` }, { status: res.status });

    } else if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "llama3-8b-8192", messages: [{ role: "user", content: prompt }], max_tokens: 5 }),
      });
      if (res.status === 401) return NextResponse.json({ error: "Chave inválida." }, { status: 401 });
      if (!res.ok) return NextResponse.json({ error: `Erro ao validar: ${res.statusText}` }, { status: res.status });

    } else if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 5,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.status === 401) return NextResponse.json({ error: "Chave inválida." }, { status: 401 });
      if (!res.ok) return NextResponse.json({ error: `Erro ao validar: ${res.statusText}` }, { status: res.status });

    } else if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], max_tokens: 5 }),
      });
      if (res.status === 401) return NextResponse.json({ error: "Chave inválida." }, { status: 401 });
      if (!res.ok) return NextResponse.json({ error: `Erro ao validar: ${res.statusText}` }, { status: res.status });

    } else if (provider === "github") {
      const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], max_tokens: 5 }),
      });
      if (res.status === 401) return NextResponse.json({ error: "Chave inválida." }, { status: 401 });
      if (!res.ok) return NextResponse.json({ error: `Erro ao validar: ${res.statusText}` }, { status: res.status });

    } else {
      return NextResponse.json({ error: "Provedor desconhecido." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao conectar. Verifique sua internet." }, { status: 500 });
  }
}
