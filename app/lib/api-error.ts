import { NextResponse } from "next/server";

/** Trata erros de chamadas à IA e retorna resposta JSON adequada */
export function handleApiError(error: unknown, context: string) {
  console.error(`Erro em ${context}:`, error);

  // Timeout (AbortSignal)
  if (error instanceof Error && error.name === "AbortError") {
    return NextResponse.json(
      { error: "A IA demorou muito para responder. Tente novamente ou use um modelo mais rápido." },
      { status: 504 }
    );
  }

  // Rate limit
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status: number }).status
      : 0;

  if (status === 429) {
    return NextResponse.json(
      { error: "Limite de requisições atingido. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }

  if (status === 401) {
    return NextResponse.json(
      { error: "Chave de API inválida ou expirada. Verifique nas Configurações." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { error: `Erro ao ${context}. Verifique sua chave de API e tente novamente.` },
    { status: 500 }
  );
}
