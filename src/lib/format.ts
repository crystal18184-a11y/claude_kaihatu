export function formatYen(amount: number): string {
  return `¥${Math.round(amount).toLocaleString("ja-JP")}`;
}

export function formatYenCompact(amount: number): string {
  const v = Math.round(amount);
  if (v >= 10000) {
    const wan = v / 10000;
    return wan >= 10 ? `${Math.round(wan)}万` : `${wan.toFixed(1)}万`;
  }
  return v.toLocaleString("ja-JP");
}
