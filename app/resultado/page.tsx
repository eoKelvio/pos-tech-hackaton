"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Printer, Plus, Clock, BookOpen } from "lucide-react";
import { getHistorico, TIPO_LABELS, type Registro } from "../lib/historico";

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-foreground mt-7 mb-2 first:mt-0">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-medium text-foreground mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-muted-foreground mb-1 text-sm">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-muted-foreground mb-2 leading-relaxed">')
    .replace(/^(?!<[hli])(.+)$/gm, '<p class="text-sm text-muted-foreground mb-2 leading-relaxed">$1</p>');
}

const NOVO_HREF: Record<string, string> = {
  plano: "/criar",
  tarefa: "/tarefas",
  questionario: "/questionarios",
  correcao: "/corrigir",
};

export default function Resultado() {
  const router = useRouter();
  const [registro, setRegistro] = useState<Registro | null>(null);

  useEffect(() => {
    // support both old "planoAtual" and new "registroAtual"
    const raw = localStorage.getItem("registroAtual") ?? localStorage.getItem("planoAtual");
    if (!raw) { router.push("/"); return; }
    const parsed = JSON.parse(raw);
    // migrate old plano format
    if (!parsed.tipo) parsed.tipo = "plano";
    if (!parsed.conteudo) parsed.conteudo = parsed.plano ?? "";
    setRegistro(parsed);
    document.title = `${parsed.tema || "Resultado"} | EduPlan AI`;
  }, [router]);

  if (!registro) return null;

  const tipoLabel = TIPO_LABELS[registro.tipo] ?? "Resultado";
  const novoHref = NOVO_HREF[registro.tipo] ?? "/criar";

  return (
    <>
      <div className="no-print">
        <AppShell>
          <div className="p-8 max-w-3xl space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{tipoLabel}</h1>
                <p className="text-xs text-muted-foreground mt-1">Gerado em {registro.data} · EduPlan AI</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => router.push(novoHref)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Novo
                </Button>
                <Button size="sm" onClick={() => window.print()} className="gap-1.5">
                  <Printer className="h-3.5 w-3.5" /> Imprimir / PDF
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <div className="px-6 py-4 flex flex-wrap gap-2 bg-muted/30">
                <Badge variant="secondary">{registro.materia}</Badge>
                <Badge variant="secondary">{registro.serie}</Badge>
                <Badge variant="outline">{registro.tema}</Badge>
                {registro.tipo === "plano" && registro.duracao && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />{registro.duracao} min
                  </Badge>
                )}
                {registro.tipo === "tarefa" && registro.tipoTarefa && (
                  <Badge variant="outline">{registro.tipoTarefa}</Badge>
                )}
                {registro.tipo === "questionario" && registro.tipoQuestao && (
                  <Badge variant="outline">{registro.tipoQuestao} · {registro.quantidade}q</Badge>
                )}
                {registro.dificuldade && (
                  <Badge variant="outline">{registro.dificuldade}</Badge>
                )}
                {registro.planoVinculadoTema && (
                  <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    <BookOpen className="h-3 w-3" /> {registro.planoVinculadoTema}
                  </Badge>
                )}
              </div>
              <Separator />
              <div className="px-8 py-7" dangerouslySetInnerHTML={{ __html: renderMarkdown(registro.conteudo) }} />
            </div>
          </div>
        </AppShell>
      </div>

      <div className="hidden print:block p-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{registro.materia}</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{registro.serie}</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">{registro.tema}</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(registro.conteudo) }} />
      </div>
    </>
  );
}
