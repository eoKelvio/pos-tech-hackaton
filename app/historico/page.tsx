"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, ChevronRight, Plus, Trash2, Clock, ClipboardCheck, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { getHistorico, deleteFromHistorico, TIPO_LABELS, type Registro, type TipoRegistro } from "../lib/historico";

const FILTROS: { key: TipoRegistro | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "plano", label: "Planos de Aula" },
  { key: "tarefa", label: "Tarefas" },
  { key: "questionario", label: "Questionários" },
];

const TIPO_ICON = {
  plano: FileText,
  tarefa: ClipboardCheck,
  questionario: FileQuestion,
};

const TIPO_COLOR = {
  plano: "text-primary bg-primary/10",
  tarefa: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  questionario: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
};

export default function Historico() {
  const router = useRouter();
  const [historico, setHistorico] = useState<Registro[]>([]);
  const [filtro, setFiltro] = useState<TipoRegistro | "todos">("todos");

  useEffect(() => {
    document.title = "Meu Histórico | EduPlan AI";
    setHistorico(getHistorico());
  }, []);

  function abrirRegistro(registro: Registro) {
    localStorage.setItem("registroAtual", JSON.stringify(registro));
    router.push("/resultado");
  }

  function limparHistorico() {
    localStorage.removeItem("historico");
    setHistorico([]);
  }

  function excluirItem(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    deleteFromHistorico(id);
    setHistorico(getHistorico());
  }

  const filtrado = filtro === "todos" ? historico : historico.filter((r) => r.tipo === filtro);

  return (
    <AppShell>
      <div className="p-8 max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtrado.length} {filtrado.length !== 1 ? "itens" : "item"}
              {filtro !== "todos" ? ` · ${FILTROS.find(f => f.key === filtro)?.label}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {historico.length > 0 && (
              <Button variant="ghost" size="sm" onClick={limparHistorico} className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
              </Button>
            )}
            <Link
              href={filtro === "tarefa" ? "/tarefas" : filtro === "questionario" ? "/questionarios" : "/criar"}
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              <Plus className="h-3.5 w-3.5" /> Novo
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {FILTROS.map((f) => {
            const count = f.key === "todos" ? historico.length : historico.filter((r) => r.tipo === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFiltro(f.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  filtro === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                )}
              >
                {f.label}
                <span className={cn("ml-1.5 text-xs", filtro === f.key ? "opacity-80" : "text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filtrado.length === 0 ? (
          <div className="rounded-xl border bg-card flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">Nenhum item encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filtro === "todos" ? "Seu histórico aparecerá aqui" : `Nenhum ${TIPO_LABELS[filtro as TipoRegistro]?.toLowerCase()} gerado ainda`}
            </p>
            <Link
              href={filtro === "tarefa" ? "/tarefas" : filtro === "questionario" ? "/questionarios" : "/criar"}
              className={cn(buttonVariants({ size: "sm" }), "mt-5")}
            >
              Criar agora
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            {filtrado.map((reg, i) => {
              const Icon = TIPO_ICON[reg.tipo] ?? FileText;
              const colorClass = TIPO_COLOR[reg.tipo] ?? TIPO_COLOR.plano;
              return (
                <div key={reg.id}>
                  <div
                    onClick={() => abrirRegistro(reg)}
                    className="group w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{reg.tema}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">{reg.materia}</Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">{reg.serie}</Badge>
                          <span className="text-xs text-muted-foreground">{TIPO_LABELS[reg.tipo]}</span>
                          {reg.tipo === "plano" && reg.duracao && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />{reg.duracao}min
                            </span>
                          )}
                          {reg.planoVinculadoTema && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">↗ {reg.planoVinculadoTema}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:block mr-1">{reg.data}</span>
                      <button
                        onClick={(e) => excluirItem(e, reg.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  {i < filtrado.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
