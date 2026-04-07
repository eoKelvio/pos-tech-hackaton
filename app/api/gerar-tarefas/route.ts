import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/app/lib/ai-generate";
import { getApiKeyForProvider } from "@/app/lib/env-keys";
import { sanitize } from "@/app/lib/sanitize";
import { handleApiError } from "@/app/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const materia      = sanitize(body.materia,       "short");
    const serie        = sanitize(body.serie,         "short");
    const tema         = sanitize(body.tema,          "medium");
    const tipoTarefa   = sanitize(body.tipoTarefa,    "short");
    const dificuldade  = sanitize(body.dificuldade,   "short");
    const observacoes  = sanitize(body.observacoes,   "medium");
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
    return handleApiError(error, "gerar a tarefa");
  }
}
