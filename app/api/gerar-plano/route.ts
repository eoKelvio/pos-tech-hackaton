import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/app/lib/ai-generate";
import { getApiKeyForProvider } from "@/app/lib/env-keys";

export async function POST(req: NextRequest) {
  try {
    const { materia, serie, tema, duracao, objetivos, aiConfig } = await req.json();

    if (!materia || !serie || !tema || !duracao) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const provider = aiConfig?.provider ?? "gemini";
    const model = aiConfig?.model ?? "gemini-1.5-flash";
    const apiKey = getApiKeyForProvider(provider);

    if (!apiKey) {
      return NextResponse.json({ error: "Nenhuma chave de API configurada. Acesse Configurações para adicionar sua chave." }, { status: 400 });
    }

    const prompt = `Você é um especialista em educação pública brasileira. Crie um plano de aula completo e detalhado com as seguintes informações:

- Matéria: ${materia}
- Série/Ano: ${serie}
- Tema: ${tema}
- Duração: ${duracao} minutos
- Objetivos: ${objetivos || "Não especificados"}

Estruture o plano de aula EXATAMENTE neste formato:

## Identificação
**Matéria:** ${materia}
**Série/Ano:** ${serie}
**Tema:** ${tema}
**Duração:** ${duracao} minutos

## Objetivos de Aprendizagem
[Liste de 3 a 5 objetivos claros e mensuráveis]

## Materiais Necessários
[Liste os materiais necessários para a aula]

## Desenvolvimento da Aula

### 1. Introdução (${Math.round(Number(duracao) * 0.2)} minutos)
[Descreva como iniciar a aula, despertar o interesse dos alunos e apresentar o tema]

### 2. Desenvolvimento (${Math.round(Number(duracao) * 0.6)} minutos)
[Descreva as atividades principais, explicações e dinâmicas]

### 3. Conclusão (${Math.round(Number(duracao) * 0.2)} minutos)
[Descreva como encerrar a aula, fixar o aprendizado e fazer a revisão]

## Atividades Práticas
[Sugira 2 a 3 atividades práticas ou exercícios para os alunos]

## Avaliação
[Descreva como avaliar o aprendizado dos alunos]

## Dicas para o Professor
[Dê 2 a 3 dicas práticas para aplicar essa aula com sucesso no ensino público]

Escreva em português brasileiro, de forma clara e prática, pensando na realidade do ensino público.`;

    const text = await generateText({ provider, model, apiKey, prompt });
    return NextResponse.json({ plano: text });
  } catch (error: unknown) {
    console.error("Erro ao gerar plano:", error);

    const status = typeof error === "object" && error !== null && "status" in error
      ? (error as { status: number }).status : 0;

    if (status === 429) {
      return NextResponse.json({ error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente." }, { status: 429 });
    }

    return NextResponse.json({ error: "Erro ao gerar o plano de aula. Verifique sua chave de API e tente novamente." }, { status: 500 });
  }
}
