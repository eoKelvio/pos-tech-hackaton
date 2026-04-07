export type TipoRegistro = "plano" | "tarefa" | "questionario" | "correcao";

export interface Registro {
  id: number;
  data: string;
  tipo: TipoRegistro;
  materia: string;
  serie: string;
  tema: string;
  conteudo: string;
  // plano
  duracao?: string;
  objetivos?: string;
  // tarefa
  tipoTarefa?: string;
  // questionario
  tipoQuestao?: string;
  quantidade?: string;
  dificuldade?: string;
  // vínculo
  planoVinculadoId?: number;
  planoVinculadoTema?: string;
  // correcao
  tipoAvaliacao?: string;
  nomeAluno?: string;
  notaFinal?: string;
}

export function getHistorico(): Registro[] {
  if (typeof window === "undefined") return [];
  try {
    const data = JSON.parse(localStorage.getItem("historico") || "[]");
    return data.map((r: Record<string, unknown>) => ({
      ...r,
      tipo: (r.tipo as TipoRegistro) ?? "plano",
      conteudo: (r.conteudo as string) ?? (r.plano as string) ?? "",
    }));
  } catch { return []; }
}

export function deleteFromHistorico(id: number) {
  const historico = getHistorico().filter((r) => r.id !== id);
  localStorage.setItem("historico", JSON.stringify(historico));
}

export function saveToHistorico(registro: Omit<Registro, "id" | "data">): Registro {
  const historico = getHistorico();
  const novo: Registro = {
    id: Date.now(),
    data: new Date().toLocaleDateString("pt-BR"),
    ...registro,
  };
  historico.unshift(novo);
  localStorage.setItem("historico", JSON.stringify(historico.slice(0, 30)));
  return novo;
}

export function getPlanos(): Registro[] {
  return getHistorico().filter((r) => r.tipo === "plano");
}

export const TIPO_LABELS: Record<TipoRegistro, string> = {
  plano: "Plano de Aula",
  tarefa: "Tarefa",
  questionario: "Questionário",
  correcao: "Correção",
};

export const TIPO_COLORS: Record<TipoRegistro, string> = {
  plano: "bg-primary/10 text-primary",
  tarefa: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  questionario: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  correcao: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};
