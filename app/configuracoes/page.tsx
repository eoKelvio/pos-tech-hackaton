"use client";

import { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Eye, EyeOff, Save, Trash2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVIDERS } from "../lib/providers";

export default function Configuracoes() {
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].id);
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [configs, setConfigs] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isRevealedKey, setIsRevealedKey] = useState(false);

  async function loadConfigs() {
    const res = await fetch("/api/config");
    const data = await res.json();
    const configured: Record<string, boolean> = data.configured ?? {};
    setConfigs(configured);
    // sync localStorage flags so ModelSelector & Sidebar can read without an extra fetch
    localStorage.setItem("aiConfigs", JSON.stringify(configured));
  }

  useEffect(() => {
    document.title = "Configurações | EduPlan AI";
    loadConfigs().then(() => setLoaded(true));
  }, []);

  const currentProvider = PROVIDERS.find((p) => p.id === selectedProvider)!;
  const hasKey = !!configs[selectedProvider];

  function selectProvider(id: string) {
    setSelectedProvider(id);
    setInputValue("");
    setShowKey(false);
    setSaved(false);
    setIsRevealedKey(false);
  }

  async function toggleReveal() {
    if (inputValue === "" && hasKey) {
      // Reveal stored key from server
      const res = await fetch(`/api/config?provider=${selectedProvider}&reveal=true`);
      const data = await res.json();
      setInputValue(data.apiKey ?? "");
      setIsRevealedKey(true);
      setShowKey(true);
    } else {
      setShowKey((v) => !v);
    }
  }

  async function handleSave() {
    if (!inputValue.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, apiKey: inputValue.trim() }),
      });
      await loadConfigs();
      setInputValue("");
      setShowKey(false);
      setIsRevealedKey(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(providerId: string) {
    await fetch("/api/config", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: providerId }),
    });
    await loadConfigs();
    if (providerId === selectedProvider) {
      setInputValue("");
      setShowKey(false);
    }
  }

  const configuredProviders = PROVIDERS.filter((p) => configs[p.id]);

  if (!loaded) return null;

  return (
    <AppShell>
      <div className="p-8 max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Adicione sua API key de cada provedor. As chaves são salvas com segurança no servidor. O modelo você escolhe na hora de gerar.
          </p>
        </div>

        {/* Provedores configurados */}
        {configuredProviders.length > 0 && (
          <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Provedores ativos</p>
            <div className="space-y-2">
              {configuredProviders.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm font-medium">{p.name}</span>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">••••••••</span>
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => handleRemove(p.id)}
                    className="h-7 gap-1 text-destructive hover:text-destructive text-xs"
                  >
                    <Trash2 className="h-3 w-3" /> Remover
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-8 space-y-8">

            {/* Provedor */}
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Provedor</p>
              <div className="flex flex-wrap gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id} type="button"
                    onClick={() => selectProvider(p.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold border transition-all relative",
                      selectedProvider === p.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {p.name}
                    {configs[p.id] && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{currentProvider.description}</p>
            </div>

            <Separator />

            {/* API Key */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Chave de API</p>
                <p className="text-xs text-muted-foreground mt-1">{currentProvider.keyHint}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  API Key — {currentProvider.name}
                  {hasKey && !inputValue && (
                    <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-normal text-xs">
                      <Lock className="h-3 w-3" /> chave salva
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showKey ? "text" : "password"}
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setSaved(false); setIsRevealedKey(false); }}
                    placeholder={hasKey ? "Clique no olho para revelar a chave salva..." : currentProvider.keyPlaceholder}
                    className="h-11 pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={toggleReveal}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    title={hasKey && !inputValue ? "Revelar chave salva" : showKey ? "Ocultar" : "Mostrar"}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chave salva com segurança no servidor, nunca exposta ao navegador.
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!inputValue.trim() || saving || isRevealedKey}
              className="w-full gap-2 h-11 font-semibold"
            >
              {saved
                ? <><Check className="h-4 w-4" /> Salvo!</>
                : <><Save className="h-4 w-4" /> Salvar {currentProvider.name}</>
              }
            </Button>

          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
