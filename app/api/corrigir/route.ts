import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/app/lib/ai-generate";
import { getApiKeyForProvider } from "@/app/lib/env-keys";
import { sanitize } from "@/app/lib/sanitize";
import { handleApiError } from "@/app/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const tipoAvaliacao          = sanitize(body.tipoAvaliacao,          "short");
    const materia                = sanitize(body.materia,                "short");
    const serie                  = sanitize(body.serie,                  "short");
    const nomeAluno              = sanitize(body.nomeAluno,              "short");
    const enunciado              = sanitize(body.enunciado,              "long");
    const resposta               = sanitize(body.resposta,               "content");
    const criteriosPersonalizados = sanitize(body.criteriosPersonalizados, "long");
    const imageBase64            = typeof body.imageBase64 === "string" ? body.imageBase64 : undefined;
    const imageMimeType          = sanitize(body.imageMimeType,          "short");

    if (!tipoAvaliacao || (!resposta && !imageBase64)) {
      return NextResponse.json({ error: "Preencha a resposta do aluno ou envie um arquivo." }, { status: 400 });
    }

    const provider = sanitize(body.aiConfig?.provider, "short") || "gemini";
    const model    = sanitize(body.aiConfig?.model,    "short") || "gemini-1.5-flash";
    const apiKey = getApiKeyForProvider(provider);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Nenhuma chave de API configurada. Acesse Configurações para adicionar sua chave." },
        { status: 400 }
      );
    }

    const criteriosPorTipo: Record<string, string> = {
      questionario: "Acertos e erros por questão, gabarito, nota em porcentagem",
      redacao: "Tema/proposta, coesão e coerência, argumentação, repertório, gramática e norma culta, proposta de intervenção (se aplicável)",
      tarefa: "Completude da tarefa, raciocínio e desenvolvimento, resultado correto, apresentação",
      projeto: "Criatividade e inovação, execução e qualidade, conteúdo e embasamento, apresentação e organização",
      prova: "Acertos por questão, desenvolvimento das respostas dissertativas, nota final",
      outro: "Qualidade geral, cumprimento dos objetivos, apresentação",
    };

    const criteriosSugeridos = criteriosPorTipo[tipoAvaliacao] ?? criteriosPorTipo.outro;

    const respostaTexto = imageBase64
      ? "(A resposta do aluno está na imagem anexada — analise-a para realizar a correção)"
      : resposta;

    const prompt = `Você é um professor experiente do ensino público brasileiro fazendo a correção de uma avaliação.

## Dados da Avaliação
- Tipo: ${tipoAvaliacao}
${materia ? `- Matéria: ${materia}` : ""}
${serie ? `- Série/Turma: ${serie}` : ""}
${nomeAluno ? `- Aluno(a): ${nomeAluno}` : ""}

## Enunciado / Gabarito / Proposta
${enunciado || "Não fornecido — corrija com base no que é esperado para o tipo de avaliação informado."}

## Resposta do Aluno
${respostaTexto}

## Critérios de Avaliação
Critérios sugeridos para este tipo: ${criteriosSugeridos}
${criteriosPersonalizados ? `\nCritérios e observações do professor:\n${criteriosPersonalizados}` : ""}

## Instruções para a Correção
- Escreva em português brasileiro
- Seja justo, construtivo e didático
- Use a seguinte estrutura obrigatória:

## Resultado da Correção

### Nota Final
Informe a nota de 0 a 10 com justificativa breve.

### Avaliação por Critério
Para cada critério relevante, dê uma nota parcial e um comentário explicando o que foi bem e o que pode melhorar.

### Pontos Positivos
Liste os aspectos que o aluno demonstrou domínio.

### Pontos a Melhorar
Liste os aspectos que precisam de desenvolvimento, com orientações práticas.

### Feedback Geral
Um parágrafo motivador e construtivo direcionado ao aluno, explicando o desempenho geral.

Faça a correção agora:`;

    const text = await generateText({
      provider, model, apiKey, prompt,
      imageBase64: imageBase64 ?? undefined,
      imageMimeType: imageMimeType ?? undefined,
    });

    return NextResponse.json({ correcao: text });
  } catch (error: unknown) {
    return handleApiError(error, "realizar a correção");
  }
}
