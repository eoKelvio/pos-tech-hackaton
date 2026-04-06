"use client";

import { useState, useEffect } from "react";
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
import { FileQuestion, Loader2, Printer, Copy, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIConfig } from "../lib/providers";
import type { Registro } from "../lib/historico";
import { saveToHistorico } from "../lib/historico";

const TIPOS = ["Múltipla Escolha", "Verdadeiro ou Falso", "Dissertativa", "Mista"];
const QTDS = ["5", "8", "10", "15"];
const DIFICULDADES = ["Fácil", "Médio", "Difícil"];

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-foreground mt-6 mb-2 first:mt-0">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-medium text-foreground mt-4 mb-1">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/^(\d+\.) (.+)$/gm, '<div class="flex gap-2 mb-3"><span class="font-semibold text-primary shrink-0">$1</span><span class="text-sm text-foreground">$2</span></div>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-muted-foreground mb-1 text-sm">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-muted-foreground mb-2 leading-relaxed">')
    .replace(/^(?!<[hdli])(.+)$/gm, '<p class="text-sm text-muted-foreground mb-2 leading-relaxed">$1</p>');
}

export default function GerarQuestionarios() {
  const [form, setForm] = useState({ materia: "", serie: "", tema: "", tipo: "Múltipla Escolha", quantidade: "10", dificuldade: "Médio", contexto: "" });
  const [planoVinculado, setPlanoVinculado] = useState<Registro | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { document.title = "Gerar Questionários | EduPlan AI"; }, []);

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
      const res = await fetch("/api/gerar-questionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          planoContexto: planoVinculado?.conteudo ?? null,
          aiConfig,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao gerar o questionário."); return; }
      setConteudo(data.conteudo);
      saveToHistorico({
        tipo: "questionario",
        materia: form.materia,
        serie: form.serie,
        tema: form.tema,
        conteudo: data.conteudo,
        tipoQuestao: form.tipo,
        quantidade: form.quantidade,
        dificuldade: form.dificuldade,
        planoVinculadoId: planoVinculado?.id,
        planoVinculadoTema: planoVinculado?.tema,
      });
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
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
          <h1 className="text-3xl font-bold tracking-tight">Gerar Questionário</h1>
          <p className="text-muted-foreground mt-2">
            Preencha as informações abaixo e a IA criará um questionário personalizado para avaliar seus alunos.
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
                    <Label htmlFor="tema">Tema / Conteúdo <span className="text-destructive">*</span></Label>
                    <Input id="tema" name="tema" value={form.tema} onChange={handleChange} required placeholder="Ex: Frações, Células, Segunda Guerra..." className="h-11" />
                  </div>
                </div>

                <Separator />

                {/* Tipo */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipo de Questão</p>
                  <div className="flex gap-2 flex-wrap">
                    {TIPOS.map((t) => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, tipo: t })}
                        className={cn("px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                          form.tipo === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        )}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quantidade */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quantidade de Questões</p>
                  <div className="flex gap-3">
                    {QTDS.map((q) => (
                      <button key={q} type="button" onClick={() => setForm({ ...form, quantidade: q })}
                        className={cn("flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all",
                          form.quantidade === q ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        )}>
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 max-w-56 mt-1">
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      placeholder="Personalizado"
                      value={QTDS.includes(form.quantidade) ? "" : form.quantidade}
                      onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                      className="h-10 text-sm"
                    />
                    <span className="text-sm text-muted-foreground shrink-0">Questões</span>
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

                {/* Contexto */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contexto Adicional</p>
                    <p className="text-sm text-muted-foreground mt-1">Opcional — detalhes extras para personalizar o questionário.</p>
                  </div>
                  <Textarea name="contexto" value={form.contexto} onChange={handleChange} rows={3}
                    placeholder="Ex: Foque em aplicações do cotidiano, inclua questões interpretativas..."
                    className="resize-none text-sm leading-relaxed" />
                </div>

                {erro && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
                )}

                <Button type="submit" disabled={loading} className="w-full gap-2 h-12 text-base font-semibold" size="lg">
                  {loading
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Gerando questionário...</>
                    : <><Zap className="h-5 w-5" /> Gerar Questionário</>
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
                    <h2 className="text-base font-semibold">Questionário gerado</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{form.quantidade} questões · {form.tipo} · {form.dificuldade}</p>
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
              <FileQuestion className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">O questionário gerado aparecerá aqui</p>
              <p className="text-xs text-muted-foreground mt-1">Preencha o formulário e clique em gerar</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
