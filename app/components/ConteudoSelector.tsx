"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link2, X } from "lucide-react";
import { getHistorico, TIPO_LABELS, type Registro } from "@/app/lib/historico";

interface Props {
  onSelect: (registro: Registro | null) => void;
  selected: Registro | null;
  label?: string;
  placeholder?: string;
}

export default function ConteudoSelector({
  onSelect,
  selected,
  label = "Vincular gabarito / enunciado",
  placeholder = "Selecionar atividade gerada...",
}: Props) {
  const [itens, setItens] = useState<Registro[]>([]);

  useEffect(() => {
    const historico = getHistorico().filter((r) => r.tipo !== "correcao");
    setItens(historico);
  }, []);

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        {label} <span className="font-normal">(opcional)</span>
      </Label>
      {itens.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Nenhum conteúdo gerado ainda. Crie um plano, tarefa ou questionário para poder vincular aqui.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <Select
            value={selected ? String(selected.id) : ""}
            onValueChange={(val) => {
              if (!val) { onSelect(null); return; }
              const item = itens.find((r) => String(r.id) === val);
              onSelect(item ?? null);
            }}
          >
            <SelectTrigger className="h-9 flex-1 text-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              {itens.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  <span className="font-medium">{r.tema}</span>
                  <span className="text-muted-foreground ml-1.5 text-xs">
                    · {TIPO_LABELS[r.tipo]} · {r.materia}
                  </span>
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
          O conteúdo de <span className="font-medium">{selected.tema}</span> será usado como gabarito/enunciado.
        </p>
      )}
    </div>
  );
}
