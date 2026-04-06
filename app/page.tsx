"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "./components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, BookOpen, Star, Zap, ChevronRight, ClipboardList, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Registro {
  id: number; data: string; tipo?: string; materia: string; serie: string;
  tema: string; duracao?: string; plano?: string; conteudo?: string;
}

export default function Dashboard() {
  const [historico, setHistorico] = useState<Registro[]>([]);
  const [aiProvider, setAiProvider] = useState<string>("");

  useEffect(() => {
    document.title = "Dashboard | EduPlan AI";
    const data = localStorage.getItem("historico");
    if (data) setHistorico(JSON.parse(data));
    // Read configured provider for badge
    try {
      const configs = JSON.parse(localStorage.getItem("aiConfigs") || "{}");
      const configured = Object.entries(configs).find(([, v]) => v === true);
      if (configured) setAiProvider(configured[0] as string);
    } catch { /* ignore */ }
  }, []);

  const totalConteudos = historico.length;
  const totalPlanos = historico.filter((r) => !r.tipo || r.tipo === "plano").length;
  const materiaCount = historico.reduce<Record<string, number>>((acc, r) => {
    acc[r.materia] = (acc[r.materia] || 0) + 1; return acc;
  }, {});
  const materiaMaisUsada = Object.entries(materiaCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  const totalMaterias = Object.keys(materiaCount).length;
  const recentes = historico.slice(0, 5);

  const PROVIDER_LABELS: Record<string, string> = {
    gemini: "Google Gemini", anthropic: "Claude Anthropic",
    groq: "Groq", openai: "OpenAI", github: "GitHub Models",
  };
  const badgeLabel = aiProvider ? `Powered by ${PROVIDER_LABELS[aiProvider] ?? aiProvider}` : "Powered by IA";

  function abrirPlano(registro: Registro) {
    localStorage.setItem("registroAtual", JSON.stringify(registro));
    window.location.href = "/resultado";
  }

  return (
    <AppShell>
      <div className="p-8 space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Visão geral da sua atividade no EduPlan AI.</p>
        </div>

        {/* Hero */}
        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
          <CardContent className="pt-8 pb-8">
            <Badge variant="secondary" className="mb-4 gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {badgeLabel}
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Crie planos de aula com IA</h2>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Economize tempo e foque no que importa: ensinar. A IA gera planos completos e personalizados em segundos.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/criar" className={cn(buttonVariants({ size: "default" }), "gap-2")}>
                <Zap className="h-4 w-4" /> Gerar Plano de Aula
              </Link>
              <Link href="/tarefas" className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}>
                <ClipboardCheck className="h-4 w-4" /> Gerar Tarefas
              </Link>
              <Link href="/questionarios" className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}>
                <ClipboardList className="h-4 w-4" /> Gerar Questionários
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Conteúdos gerados", value: totalConteudos, icon: FileText, color: "text-primary" },
            { label: "Matérias diferentes", value: totalMaterias, icon: BookOpen, color: "text-emerald-500" },
            { label: "Matéria favorita", value: materiaMaisUsada, icon: Star, color: "text-amber-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
                  <div className="min-w-0">
                    <p className="text-2xl font-bold truncate">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Como funciona */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Como funciona</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-5 space-y-5">
              {[
                { n: "1", title: "Preencha o formulário", desc: "Informe matéria, turma, tema e duração.", color: "bg-primary/10 text-primary" },
                { n: "2", title: "IA gera seu plano", desc: "A IA cria um conteúdo completo em segundos.", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
                { n: "3", title: "Salve ou imprima", desc: "Exporte como PDF ou acesse pelo histórico.", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
              ].map((item) => (
                <div key={item.n} className="flex gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${item.color}`}>
                    {item.n}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Planos recentes */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Conteúdos recentes</CardTitle>
              {historico.length > 0 && (
                <Link href="/historico" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs h-7")}>
                  Ver todos
                </Link>
              )}
            </CardHeader>
            <Separator />

            {recentes.length === 0 ? (
              <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Nenhum conteúdo gerado ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Crie seu primeiro plano de aula ou questão</p>
                <Link href="/criar" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
                  Começar agora
                </Link>
              </CardContent>
            ) : (
              <div>
                {recentes.map((reg, i) => (
                  <div key={reg.id}>
                    <button
                      onClick={() => abrirPlano(reg)}
                      className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{reg.tema}</p>
                          <p className="text-xs text-muted-foreground truncate">{reg.materia} · {reg.serie}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:block">{reg.data}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                    {i < recentes.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
