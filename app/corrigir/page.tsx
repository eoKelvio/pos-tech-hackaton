"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "../components/AppShell";
import ModelSelector from "../components/ModelSelector";
import ConteudoSelector from "../components/ConteudoSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle, Loader2, Printer, Copy, Check,
  ClipboardCheck, Upload, X, FileText, Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIConfig } from "../lib/providers";
import { saveToHistorico, type Registro } from "../lib/historico";

const TIPOS = [
  { id: "questionario", label: "Questionário" },
  { id: "redacao", label: "Redação" },
  { id: "tarefa", label: "Tarefa / Exercício" },
  { id: "projeto", label: "Projeto" },
  { id: "prova", label: "Prova Mista" },
  { id: "outro", label: "Outro" },
];

const VISION_PROVIDERS = ["gemini", "anthropic", "openai", "github"];

function renderMarkdown(text: string) {
  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-foreground mt-6 mb-2 first:mt-0">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold text-foreground mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/^(\d+\.) (.+)$/gm, '<div class="flex gap-2 mb-2"><span class="font-semibold text-primary shrink-0 text-sm">$1</span><span class="text-sm text-foreground">$2</span></div>')
    .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-muted-foreground mb-1 text-sm">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-sm text-muted-foreground mb-2 leading-relaxed">')
    .replace(/^(?!<[hdli])(.+)$/gm, '<p class="text-sm text-muted-foreground mb-2 leading-relaxed">$1</p>');
}

interface FileState {
  name: string;
  type: "text" | "image";
  content?: string;       // text file content
  base64?: string;        // image base64
  mimeType?: string;      // image mime type
  preview?: string;       // image preview URL
}

export default function Corrigir() {
  const [form, setForm] = useState({
    tipoAvaliacao: "questionario",
    materia: "",
    serie: "",
    nomeAluno: "",
    resposta: "",
    criteriosPersonalizados: "",
  });
  const [gabarito, setGabarito] = useState<Registro | null>(null);
  const [arquivo, setArquivo] = useState<FileState | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [correcao, setCorrecao] = useState("");
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = "Corrigir Avaliação | EduPlan AI"; }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleGabaritoSelect(registro: Registro | null) {
    setGabarito(registro);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isText = file.type === "text/plain" || file.type === "text/markdown" || file.name.endsWith(".txt") || file.name.endsWith(".md");

    if (!isImage && !isText) {
      setErro("Formato não suportado. Use imagens (.jpg, .png, .webp) ou arquivos de texto (.txt, .md).");
      return;
    }

    setErro("");
    const reader = new FileReader();

    if (isText) {
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setArquivo({ name: file.name, type: "text", content });
        setForm((f) => ({ ...f, resposta: content }));
      };
      reader.readAsText(file, "utf-8");
    } else {
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        setArquivo({ name: file.name, type: "image", base64, mimeType: file.type, preview: dataUrl });
        // clear text resposta when image is uploaded
        setForm((f) => ({ ...f, resposta: "" }));
      };
      reader.readAsDataURL(file);
    }

    // reset input so same file can be re-uploaded
    e.target.value = "";
  }

  function removerArquivo() {
    setArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const supportsVision = VISION_PROVIDERS.includes(aiConfig?.provider ?? "gemini");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const hasResposta = form.resposta.trim() || arquivo?.base64;
    if (!hasResposta) {
      setErro("Insira a resposta do aluno ou faça upload de um arquivo.");
      return;
    }

    if (arquivo?.type === "image" && !supportsVision) {
      setErro("O provedor selecionado não suporta análise de imagens. Use Gemini, Claude, OpenAI ou GitHub Models.");
      return;
    }

    setLoading(true);
    setCorrecao("");

    try {
      const res = await fetch("/api/corrigir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          enunciado: gabarito?.conteudo ?? "",
          imageBase64: arquivo?.type === "image" ? arquivo.base64 : undefined,
          imageMimeType: arquivo?.type === "image" ? arquivo.mimeType : undefined,
          aiConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setErro(data.error || "Erro ao realizar a correção."); return; }

      setCorrecao(data.correcao);

      const notaMatch = data.correcao.match(/(\d+([.,]\d+)?)\s*\/?\s*10/);
      const notaFinal = notaMatch ? notaMatch[1] : undefined;

      saveToHistorico({
        tipo: "correcao",
        materia: form.materia || "Não informada",
        serie: form.serie || "Não informada",
        tema: form.nomeAluno ? `Correção de ${form.nomeAluno}` : `Correção — ${TIPOS.find(t => t.id === form.tipoAvaliacao)?.label}`,
        conteudo: data.correcao,
        tipoAvaliacao: form.tipoAvaliacao,
        nomeAluno: form.nomeAluno || undefined,
        notaFinal,
        planoVinculadoId: gabarito?.id,
        planoVinculadoTema: gabarito?.tema,
      });
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(correcao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const tipoLabel = TIPOS.find(t => t.id === form.tipoAvaliacao)?.label ?? "";

  return (
    <AppShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Corrigir Avaliação</h1>
          <p className="text-muted-foreground mt-2">
            Cole a resposta do aluno ou envie um arquivo — a IA corrige com critérios detalhados e feedback construtivo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                <ModelSelector value={aiConfig} onChange={setAiConfig} />

                <Separator />

                {/* Tipo */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipo de Avaliação</p>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS.map((t) => (
                      <button key={t.id} type="button"
                        onClick={() => setForm({ ...form, tipoAvaliacao: t.id })}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                          form.tipoAvaliacao === t.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        )}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Identificação */}
                <div className="space-y-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Identificação</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="materia">Matéria</Label>
                      <Input id="materia" name="materia" value={form.materia} onChange={handleChange} placeholder="Ex: Matemática..." className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serie">Série / Turma</Label>
                      <Input id="serie" name="serie" value={form.serie} onChange={handleChange} placeholder="Ex: 6º ano EF..." className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeAluno">Nome do Aluno</Label>
                    <Input id="nomeAluno" name="nomeAluno" value={form.nomeAluno} onChange={handleChange} placeholder="Opcional" className="h-11" />
                  </div>
                </div>

                <Separator />

                {/* Gabarito vinculado */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Gabarito / Enunciado</p>
                  <ConteudoSelector selected={gabarito} onSelect={handleGabaritoSelect} />
                </div>

                <Separator />

                {/* Resposta do Aluno */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Resposta do Aluno <span className="text-destructive">*</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cole o texto, suba um arquivo de texto (.txt) ou uma foto da resposta (.jpg, .png).
                    </p>
                  </div>

                  {/* Upload */}
                  {arquivo ? (
                    <div className="rounded-lg border border-input bg-muted/30 p-3 flex items-center gap-3">
                      {arquivo.type === "image" ? (
                        <>
                          <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                          {arquivo.preview && (
                            <img src={arquivo.preview} alt="preview" className="h-12 w-12 object-cover rounded" />
                          )}
                        </>
                      ) : (
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{arquivo.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {arquivo.type === "image" ? "Imagem — será analisada pela IA com visão" : "Texto carregado no campo abaixo"}
                        </p>
                      </div>
                      <button type="button" onClick={removerArquivo}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-input text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/30 transition-all cursor-pointer w-fit">
                        <Upload className="h-4 w-4" />
                        Enviar arquivo (.txt, .jpg, .png)
                      </label>
                      {arquivo === null && !supportsVision && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                          ⚠ Imagens requerem Gemini, Claude, OpenAI ou GitHub Models.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Text area — oculta se imagem carregada */}
                  {arquivo?.type !== "image" && (
                    <Textarea
                      name="resposta"
                      value={form.resposta}
                      onChange={handleChange}
                      rows={6}
                      placeholder="Cole aqui a resposta, redação, resolução ou descrição do projeto do aluno..."
                      className="resize-none text-sm leading-relaxed"
                    />
                  )}
                </div>

                <Separator />

                {/* Critérios Personalizados */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Critérios e Observações do Professor</p>
                    <p className="text-sm text-muted-foreground mt-1">Opcional — peso dos critérios, contexto da turma, instruções específicas.</p>
                  </div>
                  <Textarea
                    name="criteriosPersonalizados"
                    value={form.criteriosPersonalizados}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Ex: Peso maior para argumentação (40%). A turma ainda está aprendendo, seja mais flexível. Considere que foi a primeira avaliação do bimestre..."
                    className="resize-none text-sm leading-relaxed"
                  />
                </div>

                {erro && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{erro}</div>
                )}

                <Button type="submit" disabled={loading} className="w-full gap-2 h-12 text-base font-semibold" size="lg">
                  {loading
                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Corrigindo avaliação...</>
                    : <><CheckCircle className="h-5 w-5" /> Corrigir Avaliação</>
                  }
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resultado */}
          {correcao ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold">Correção realizada</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tipoLabel}{form.nomeAluno ? ` · ${form.nomeAluno}` : ""}
                    </p>
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
                  {form.materia && <Badge variant="secondary">{form.materia}</Badge>}
                  {form.serie && <Badge variant="secondary">{form.serie}</Badge>}
                  {form.nomeAluno && <Badge variant="outline">{form.nomeAluno}</Badge>}
                  <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-500/30">{tipoLabel}</Badge>
                  {gabarito && (
                    <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      ↗ {gabarito.tema}
                    </Badge>
                  )}
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(correcao) }} />
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
              <ClipboardCheck className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">A correção aparecerá aqui</p>
              <p className="text-xs text-muted-foreground mt-1">Preencha o formulário e clique em corrigir</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
