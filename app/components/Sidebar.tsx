"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import {
  LayoutDashboard,
  FilePlus,
  ClipboardCheck,
  FileQuestion,
  History,
  Sun,
  Moon,
  Settings,
} from "lucide-react";

const navItems = [
  {
    section: "Principal",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Ferramentas IA",
    items: [
      { href: "/criar", label: "Gerar Plano de Aula", icon: FilePlus },
      { href: "/tarefas", label: "Gerar Tarefas", icon: ClipboardCheck },
      { href: "/questionarios", label: "Gerar Questionários", icon: FileQuestion },
    ],
  },
  {
    section: "Histórico",
    items: [
      { href: "/historico", label: "Meu Histórico", icon: History },
    ],
  },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full justify-start gap-2.5 text-muted-foreground"
    >
      {theme === "dark"
        ? <><Sun className="h-4 w-4" /> Tema claro</>
        : <><Moon className="h-4 w-4" /> Tema escuro</>
      }
    </Button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    try {
      const configs = JSON.parse(localStorage.getItem("aiConfigs") || "{}");
      setHasConfig(Object.values(configs).some((v) => v === true));
    } catch { setHasConfig(false); }
  }, [pathname]);

  return (
    <aside className="no-print flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
          <Image src="/icon.svg" alt="EduPlan AI" width={28} height={28} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">EduPlan AI</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ensino Público</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border space-y-1 shrink-0">
        <Link
          href="/configuracoes"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/configuracoes"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
        >
          <Settings className={cn("h-4 w-4 shrink-0", pathname === "/configuracoes" ? "text-primary" : "text-muted-foreground")} />
          Configurações
          {hasConfig && (
            <Tooltip>
              <TooltipTrigger>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shrink-0 cursor-default" />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Chaves de API configuradas
              </TooltipContent>
            </Tooltip>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}
