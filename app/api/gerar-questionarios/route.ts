import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/app/lib/ai-generate";
import { getApiKeyForProvider } from "@/app/lib/env-keys";
import { sanitize } from "@/app/lib/sanitize";
import { handleApiError } from "@/app/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const materia      = sanitize(body.materia,      "short");
    const serie        = sanitize(body.serie,        "short");
    const tema         = sanitize(body.tema,         "medium");
    const tipo         = sanitize(body.tipo,         "short");
    const quantidade   = sanitize(body.quantidade,   "short");
    const dificuldade  = sanitize(body.dificuldade,  "short");
    const contexto     = sanitize(body.contexto,     "medium");
    const planoContexto = sanitize(body.planoContexto, "content");

    if (!materia || !serie || !tema) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const provider = sanitize(body.aiConfig?.provider, "short") || "gemini";
    const model    = sanitize(body.aiConfig?.model,    "short") || "gemini-1.5-flash";
    const apiKey = getApiKeyForProvider(provider);

    if (!apiKey) {
      return NextResponse.json({ error: "Nenhuma chave de API configurada. Acesse Configurações para adicionar sua chave." }, { status: 400 });
    }

    const prompt = `Você é um professor especialista em educação pública brasileira. Crie ${quantidade} questões de ${tipo} sobre o seguinte conteúdo:

- Matéria: ${materia}
- Série/Ano: ${serie}
- Tema: ${tema}
- Dificuldade: ${dificuldade}
- Tipo: ${tipo}
${contexto ? `- Contexto adicional: ${contexto}` : ""}
${planoContexto ? `\nContexto do plano de aula vinculado:\n${planoContexto}\n` : ""}

Regras:
- Escreva em português brasileiro
- Adapte a linguagem para a série informada
- Para questões de Múltipla Escolha: inclua 4 alternativas (A, B, C, D) e indique a resposta correta ao final de cada questão
- Para Verdadeiro ou Falso: indique a resposta correta ao final
- Para Dissertativa: inclua um gabarito comentado ao final
- Para Mista: misture os tipos acima
- Numere as questões (1., 2., etc.)
- Ao final de todas as questões, adicione uma seção "## Gabarito" com as respostas

Escreva as questões agora:`;

    const text = await generateText({ provider, model, apiKey, prompt });
    return NextResponse.json({ conteudo: text });
  } catch (error: unknown) {
    return handleApiError(error, "gerar o questionário");
  }
}
