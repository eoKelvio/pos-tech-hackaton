"use client";

import { useState, useEffect } from "react";
import { renderMarkdown } from "../lib/markdown";
import AppShell from "../components/AppShell";
import ModelSelector from "../components/ModelSelector";
import PlanoSelector from "../components/PlanoSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ClipboardCheck, Loader2, Printer, Copy, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIConfig } from "../lib/providers";
import type { Registro } from "../lib/historico";
import { saveToHistorico } from "../lib/historico";

const TIPOS = ["Exercícios", "Redação", "Pesquisa", "Projeto", "Leitura", "Resolução de Problemas"];
const DIFICULDADES = ["Fácil", "Médio", "Difícil"];

export default function GerarTarefas() {
  const [form, setForm] = useState({ materia: "", serie: "", tema: "", tipoTarefa: "Exercícios", dificuldade: "Médio", observacoes: "" });
  const [planoVinculado, setPlanoVinculado] = useState<Registro | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { document.title = "Gerar Tarefas | EduPlan AI"; }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePlanoSelect(plano: Registro | null) {
    setPlanoVinculado(plano);
    if (plano) {
      setForm((f) => ({ ...f, materia: plano.materia, serie: plano.serie, tema: plano.tema }));
    } else {
      setForm((f) => ({ ...f, materia: "", serie: "", tema: "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    setConteudo("");
    try {
      const res = await fetch("/api/gerar-tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          planoContexto: planoVinculado?.conteudo ?? null,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao gerar a tarefa."); return; }
      setConteudo(data.conteudo);
      saveToHistorico({
        tipo: "tarefa",
        materia: form.materia,
        serie: form.serie,
        tema: form.tema,
        conteudo: data.conteudo,
        tipoTarefa: form.tipoTarefa,
        dificuldade: form.dificuldade,
        planoVinculadoId: planoVinculado?.id,
        planoVinculadoTema: planoVinculado?.tema,
      });
    } catch (err) {
      if (err instanceof TypeError) {
        setErro("Sem conexão. Verifique sua internet e tente novamente.");
      } else {
        setErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(conteudo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerar Tarefas</h1>
          <p className="text-muted-foreground mt-2">
            Preencha as informações abaixo e a IA criará uma tarefa personalizada para seus alunos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                <ModelSelector value={aiConfig} onChange={setAiConfig} />

                <Separator />

                <PlanoSelector selected={planoVinculado} onSelect={handlePlanoSelect} />

                {/* Identificação */}
                <div className="space-y-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identificação</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="materia">Matéria <span className="text-destructive">*</span></Label>
                      <Input id="materia" name="materia" value={form.materia} onChange={handleChange} required placeholder="Ex: Matemática, Português..." className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serie">Série / Turma <span className="text-destructive">*</span></Label>
                      <Input id="serie" name="serie" value={form.serie} onChange={handleChange} required placeholder="Ex: 6º ano EF, 2º ano EM..." className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tema">Tema <span className="text-destructive">*</span></Label>
                    <Input id="tema" name="tema" value={form.tema} onChange={handleChange} required placeholder="Ex: Frações, Células, Segunda Guerra..." className="h-11" />
                  </div>
                </div>

                <Separator />

                {/* Tipo */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipo de Tarefa</p>
                  <div className="flex gap-2 flex-wrap">
                    {TIPOS.map((t) => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, tipoTarefa: t })}
                        className={cn("px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                          form.tipoTarefa === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        )}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Dificuldade */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dificuldade</p>
                  <div className="flex gap-3">
                    {DIFICULDADES.map((d) => (
                      <button key={d} type="button" onClick={() => setForm({ ...form, dificuldade: d })}
                        className={cn("flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all",
                          form.dificuldade === d ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        )}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Observações */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Observações</p>
                    <p className="text-sm text-muted-foreground mt-1">Opcional — detalhes extras para personalizar ainda mais a tarefa.</p>
                  </div>
                  <Textarea name="observacoes" value={form.observacoes} onChange={handleChange} rows={3}
                    placeholder="Ex: Foque em exercícios práticos do cotidiano, evite questões muito abstratas..."
                    className="resize-none text-sm leading-relaxed" />
                </div>

                {erro && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
                )}

                {loading && (
                  <p className="text-xs text-muted-foreground text-center -mb-4">
                    Isso pode levar até 30 segundos dependendo do modelo...
                  </p>
                )}

                <Button type="submit" disabled={loading} className="w-full gap-2 h-12 text-base font-semibold" size="lg">
                  {loading
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Gerando tarefa...</>
                    : <><Zap className="h-5 w-5" /> Gerar Tarefa</>
                  }
                </Button>
              </form>
            </CardContent>
          </Card>

          {conteudo ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold">Tarefa gerada</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{form.tipoTarefa} · {form.dificuldade}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copiar} className="gap-1.5">
                      {copiado ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                    </Button>
                    <Button size="sm" onClick={() => window.print()} className="gap-1.5">
                      <Printer className="h-3.5 w-3.5" /> Imprimir
                    </Button>
                  </div>
                </div>
                <Separator className="mb-5" />
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{form.materia}</Badge>
                  <Badge variant="secondary">{form.serie}</Badge>
                  <Badge variant="outline">{form.tema}</Badge>
                  {planoVinculado && <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Plano: {planoVinculado.tema}</Badge>}
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conteudo) }} />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
              <ClipboardCheck className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">A tarefa gerada aparecerá aqui</p>
              <p className="text-xs text-muted-foreground mt-1">Preencha o formulário e clique em gerar</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
