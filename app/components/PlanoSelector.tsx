"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BookOpen, X } from "lucide-react";
import { getPlanos, type Registro } from "@/app/lib/historico";

interface Props {
  onSelect: (plano: Registro | null) => void;
  selected: Registro | null;
}

export default function PlanoSelector({ onSelect, selected }: Props) {
  const [planos, setPlanos] = useState<Registro[]>([]);

  useEffect(() => {
    setPlanos(getPlanos());
  }, []);

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BookOpen className="h-3.5 w-3.5" />
        Vincular plano de aula <span className="font-normal">(opcional)</span>
      </Label>
      {planos.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Nenhum plano gerado ainda. Crie um plano de aula primeiro para poder vincular aqui.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <Select
            value={selected ? String(selected.id) : ""}
            onValueChange={(val) => {
              if (!val) { onSelect(null); return; }
              const plano = planos.find((p) => String(p.id) === val);
              onSelect(plano ?? null);
            }}
          >
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue placeholder="Selecionar plano de aula..." />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              {planos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  <span className="font-medium">{p.tema}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">· {p.materia} · {p.serie}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-input text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
      {selected && (
        <p className="text-xs text-muted-foreground pl-0.5">
          Os campos foram preenchidos com base no plano. Você pode editá-los livremente.
        </p>
      )}
    </div>
  );
}
