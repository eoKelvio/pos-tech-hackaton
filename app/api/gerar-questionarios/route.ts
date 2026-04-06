import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/app/lib/ai-generate";
import { getApiKeyForProvider } from "@/app/lib/env-keys";

export async function POST(req: NextRequest) {
  try {
    const { materia, serie, tema, tipo, quantidade, dificuldade, contexto, planoContexto, aiConfig } = await req.json();

    if (!materia || !serie || !tema) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const provider = aiConfig?.provider ?? "gemini";
    const model = aiConfig?.model ?? "gemini-1.5-flash";
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
    console.error("Erro ao gerar questionário:", error);
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status: number }).status : 0;
    if (status === 429) {
      return NextResponse.json({ error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente." }, { status: 429 });
    }
    return NextResponse.json({ error: "Erro ao gerar o questionário. Verifique sua chave de API e tente novamente." }, { status: 500 });
  }
}
