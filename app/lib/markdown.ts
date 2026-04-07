/**
 * Centralized, XSS-safe markdown renderer.
 *
 * Strategy: escape the entire input first, then apply markdown patterns.
 * This prevents any HTML in the input from being injected, while allowing
 * our own markdown-to-HTML transformations to work correctly in sequence.
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
  // Step 1: escape all HTML in the raw input
  const safe = escapeHtml(text);

  // Step 2: apply markdown transformations (no escaping needed now)
  return safe
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-base font-semibold text-foreground mt-6 mb-2 first:mt-0">$1</h2>'
    )
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-sm font-semibold text-foreground mt-4 mb-2">$1</h3>'
    )
    .replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-semibold text-foreground">$1</strong>'
    )
    .replace(
      /^(\d+\.) (.+)$/gm,
      '<div class="flex gap-2 mb-2"><span class="font-semibold text-primary shrink-0 text-sm">$1</span><span class="text-sm text-foreground">$2</span></div>'
    )
    .replace(
      /^- (.+)$/gm,
      '<li class="ml-5 list-disc text-muted-foreground mb-1 text-sm">$1</li>'
    )
    .replace(/\n\n/g, '</p><p class="text-sm text-muted-foreground mb-2 leading-relaxed">')
    .replace(
      /^(?!<[hdlip\/])(.+)$/gm,
      '<p class="text-sm text-muted-foreground mb-2 leading-relaxed">$1</p>'
    );
}
