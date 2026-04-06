"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Bot } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { PROVIDERS, getConfiguredProviders, type AIConfig } from "@/app/lib/providers";

interface Props {
  value: AIConfig | null;
  onChange: (config: AIConfig) => void;
}

export default function ModelSelector({ value, onChange }: Props) {
  const [configured, setConfigured] = useState<ReturnType<typeof getConfiguredProviders>>([]);

  useEffect(() => {
    const list = getConfiguredProviders();
    setConfigured(list);
    if (list.length > 0 && !value) {
      // restore last selection from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("aiModelSelection") || "null");
        const savedConf = saved && list.find((c) => c.provider.id === saved.provider);
        if (savedConf) {
          const modelExists = savedConf.provider.models.find((m) => m.id === saved.model);
          onChange({ provider: saved.provider, model: modelExists ? saved.model : savedConf.provider.models[0].id });
          return;
        }
      } catch {}
      const first = list[0];
      onChange({ provider: first.provider.id, model: first.provider.models[0].id });
    }
  }, []);

  if (configured.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 border border-dashed px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Bot className="h-4 w-4 shrink-0" />
          Nenhum modelo configurado
        </div>
        <Link href="/configuracoes" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 shrink-0 h-7 text-xs")}>
          <Zap className="h-3 w-3" /> Configurar
        </Link>
      </div>
    );
  }

  const currentProviderId = value?.provider ?? configured[0].provider.id;
  const selectedProvider = PROVIDERS.find((p) => p.id === currentProviderId)!;
  const currentModel = value?.model ?? selectedProvider.models[0].id;

  const providerName = configured.find((c) => c.provider.id === currentProviderId)?.provider.name ?? currentProviderId;
  const modelName = selectedProvider.models.find((m) => m.id === currentModel)?.name ?? currentModel;

  function persist(provider: string, model: string) {
    localStorage.setItem("aiModelSelection", JSON.stringify({ provider, model }));
  }

  function onProviderChange(providerId: string) {
    const conf = configured.find((c) => c.provider.id === providerId);
    if (!conf) return;
    const model = conf.provider.models[0].id;
    persist(providerId, model);
    onChange({ provider: providerId, model });
  }

  function onModelChange(modelId: string) {
    persist(currentProviderId, modelId);
    onChange({ provider: currentProviderId, model: modelId });
  }

  return (
    <div className="flex items-center gap-2">
      <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

      <Select value={currentProviderId} onValueChange={onProviderChange}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <SelectValue>{providerName}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {configured.map(({ provider }) => (
            <SelectItem key={provider.id} value={provider.id}>{provider.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground/40 text-xs select-none">/</span>

      <Select value={currentModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[220px] h-8 text-xs">
          <SelectValue>{modelName}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {selectedProvider.models.map((m) => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
