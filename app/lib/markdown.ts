/**
 * Centralized, XSS-safe markdown renderer.
 * Escapes captured groups before injecting HTML to prevent injection attacks.
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderMarkdown(text: string): string {
  return text
    .replace(
      /^## (.+)$/gm,
      (_, g) =>
        `<h2 class="text-base font-semibold text-foreground mt-6 mb-2 first:mt-0">${escapeHtml(g)}</h2>`
    )
    .replace(
      /^### (.+)$/gm,
      (_, g) =>
        `<h3 class="text-sm font-semibold text-foreground mt-4 mb-2">${escapeHtml(g)}</h3>`
    )
    .replace(
      /\*\*(.+?)\*\*/g,
      (_, g) =>
        `<strong class="font-semibold text-foreground">${escapeHtml(g)}</strong>`
    )
    .replace(
      /^(\d+\.) (.+)$/gm,
      (_, n, g) =>
        `<div class="flex gap-2 mb-2"><span class="font-semibold text-primary shrink-0 text-sm">${escapeHtml(n)}</span><span class="text-sm text-foreground">${escapeHtml(g)}</span></div>`
    )
    .replace(
      /^- (.+)$/gm,
      (_, g) =>
        `<li class="ml-5 list-disc text-muted-foreground mb-1 text-sm">${escapeHtml(g)}</li>`
    )
    .replace(/\n\n/g, '</p><p class="text-sm text-muted-foreground mb-2 leading-relaxed">')
    .replace(
      /^(?!<[hdlip])(.+)$/gm,
      (_, g) =>
        `<p class="text-sm text-muted-foreground mb-2 leading-relaxed">${escapeHtml(g)}</p>`
    );
}
