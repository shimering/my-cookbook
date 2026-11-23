export interface SuggestionItem {
  id?: string;
  name: string;
  category?: string;
  defaultUnit?: string;
  notes?: string;
  icon?: string;
}

export function filterSuggestions(
  items: SuggestionItem[],
  inputValue: string,
  maxSuggestions = 15
): SuggestionItem[] {
  const query = inputValue.trimStart().toLowerCase();
  if (!query) return [];

  const seen = new Set<string>();
  const results: SuggestionItem[] = [];

  for (const item of items) {
    if (!item || !item.name) continue;
    const lower = item.name.toLowerCase();
    // Strictly starts with the typed query (not merely contains)
    if (lower.startsWith(query)) {
      if (!seen.has(lower)) {
        seen.add(lower);
        results.push(item);
        if (results.length >= maxSuggestions) break;
      }
    }
  }

  return results;
}
