import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/app/lib/ai-generate";
import { getApiKeyForProvider } from "@/app/lib/env-keys";

export async function POST(req: NextRequest) {
  try {
    const { materia, serie, tema, tipoTarefa, dificuldade, observacoes, planoContexto, aiConfig } = await req.json();

    if (!materia || !serie || !tema) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const provider = aiConfig?.provider ?? "gemini";
    const model = aiConfig?.model ?? "gemini-1.5-flash";
    const apiKey = getApiKeyForProvider(provider);

    if (!apiKey) {
      return NextResponse.json({ error: "Nenhuma chave de API configurada. Acesse Configurações para adicionar sua chave." }, { status: 400 });
    }

    const prompt = `Você é um professor especialista em educação pública brasileira. Crie uma tarefa para casa completa e bem estruturada com as seguintes informações:

- Matéria: ${materia}
- Série/Ano: ${serie}
- Tema: ${tema}
- Tipo de tarefa: ${tipoTarefa}
- Dificuldade: ${dificuldade}
${observacoes ? `- Observações: ${observacoes}` : ""}
${planoContexto ? `\nContexto do plano de aula vinculado:\n${planoContexto}\n` : ""}

Estruture a tarefa EXATAMENTE neste formato:

## ${tipoTarefa}: [crie um título criativo e motivador]

**Matéria:** ${materia}
**Série/Ano:** ${serie}
**Tema:** ${tema}
**Dificuldade:** ${dificuldade}

## Objetivo
[Descreva o que o aluno deve aprender ou praticar com esta tarefa]

## Descrição da Atividade
[Explique de forma clara e detalhada o que o aluno deve fazer]

## Passo a Passo
[Liste as etapas numeradas de forma objetiva]

## Critérios de Avaliação
[Liste os critérios que serão usados para corrigir/avaliar]

## Materiais Necessários
[Liste o que o aluno precisará para realizar a tarefa]

## Dica para o Aluno
[Dê uma dica prática e motivacional adequada à série]

Escreva em português brasileiro, com linguagem adequada para a série informada.`;

    const text = await generateText({ provider, model, apiKey, prompt });
    return NextResponse.json({ conteudo: text });
  } catch (error: unknown) {
    console.error("Erro ao gerar tarefa:", error);
    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status: number }).status : 0;
    if (status === 429) {
      return NextResponse.json({ error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente." }, { status: 429 });
    }
    return NextResponse.json({ error: "Erro ao gerar a tarefa. Verifique sua chave de API e tente novamente." }, { status: 500 });
  }
}
