export function renderStatusCard(entries: readonly [string, string][]): string {
  const width = Math.max(...entries.map(([label]) => label.length), 6);
  return entries
    .map(([label, value]) => `${label.padEnd(width)} : ${value}`)
    .join("\n");
}
