"use client";

import { useState, useEffect } from "react";
import { renderMarkdown } from "../lib/markdown";
import AppShell from "../components/AppShell";
import ModelSelector from "../components/ModelSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Info, Loader2, BookOpen, Printer, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIConfig } from "../lib/providers";
import { saveToHistorico } from "../lib/historico";

function InfoTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ml-1.5 cursor-default">
          <Info className="h-2.5 w-2.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-64 text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

const DURACOES = ["30", "45", "50", "60", "90", "120"];

export default function CriarPlano() {
  const [form, setForm] = useState({ materia: "", serie: "", tema: "", duracao: "50", objetivos: "" });
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { document.title = "Gerar Plano de Aula | EduPlan AI"; }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    setConteudo("");
    try {
      const res = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, aiConfig }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao gerar o plano."); return; }
      setConteudo(data.plano);
      saveToHistorico({
        tipo: "plano",
        materia: form.materia,
        serie: form.serie,
        tema: form.tema,
        conteudo: data.plano,
        duracao: form.duracao,
        objetivos: form.objetivos,
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
          <h1 className="text-3xl font-bold tracking-tight">Gerar Plano de Aula</h1>
          <p className="text-muted-foreground mt-2">
            Preencha as informações abaixo e a IA criará um plano completo e personalizado para você.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                <ModelSelector value={aiConfig} onChange={setAiConfig} />

                <Separator />

                {/* Identificação */}
                <div className="space-y-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identificação</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="materia" className="flex items-center">
                        Matéria <span className="text-destructive ml-0.5">*</span>
                        <InfoTooltip text="Informe a disciplina que você leciona. Seja específico. Ex: 'Matemática', 'Língua Portuguesa', 'Ciências Naturais'." />
                      </Label>
                      <Input id="materia" name="materia" value={form.materia} onChange={handleChange} required placeholder="Ex: Matemática, Português..." className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serie" className="flex items-center">
                        Série / Turma <span className="text-destructive ml-0.5">*</span>
                        <InfoTooltip text="Informe a série e turma. Inclua o nível de ensino. Ex: '6º ano EF', '2º ano EM — Turma B', 'EJA Intermediário'." />
                      </Label>
                      <Input id="serie" name="serie" value={form.serie} onChange={handleChange} required placeholder="Ex: 6º ano EF, 2º ano EM..." className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tema">Tema da Aula <span className="text-destructive">*</span></Label>
                    <Input id="tema" name="tema" value={form.tema} onChange={handleChange} required placeholder="Ex: Frações, Segunda Guerra Mundial, Fotossíntese..." className="h-11" />
                  </div>
                </div>

                <Separator />

                {/* Duração */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Duração</p>
                  <div className="flex flex-wrap gap-3">
                    {DURACOES.map((min) => (
                      <button
                        key={min} type="button"
                        onClick={() => setForm({ ...form, duracao: min })}
                        className={cn(
                          "px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all",
                          form.duracao === min
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        {min} min
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 max-w-48">
                    <Input
                      type="number"
                      min="1"
                      max="999"
                      placeholder="Personalizado"
                      value={DURACOES.includes(form.duracao) ? "" : form.duracao}
                      onChange={(e) => setForm({ ...form, duracao: e.target.value })}
                      className="h-10 text-sm"
                    />
                    <span className="text-sm text-muted-foreground shrink-0">min</span>
                  </div>
                </div>

                <Separator />

                {/* Objetivos */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Objetivos</p>
                    <p className="text-sm text-muted-foreground mt-1">Opcional — quanto mais detalhes, mais personalizado será o plano.</p>
                  </div>
                  <Textarea
                    name="objetivos" value={form.objetivos} onChange={handleChange} rows={4}
                    placeholder="Ex: Os alunos devem conseguir resolver equações do 2º grau e interpretar os resultados no cotidiano..."
                    className="resize-none text-sm leading-relaxed"
                  />
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
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Gerando plano de aula...</>
                    : <><Zap className="h-5 w-5" /> Gerar Plano de Aula</>
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
                    <h2 className="text-base font-semibold">Plano gerado</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{form.duracao} min · {form.materia}</p>
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
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />{form.duracao} min
                  </Badge>
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(conteudo) }} />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">O plano gerado aparecerá aqui</p>
              <p className="text-xs text-muted-foreground mt-1">Preencha o formulário e clique em gerar</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
