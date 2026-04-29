import { formatYen } from "./format";

export function buildHomeInsight(args: {
  isCurrentMonth: boolean;
  totalSpent: number;
  budget: number;
  daysInMonth: number;
  todayDate: number;
  daysLeft: number;
  dailyAllowance: number;
  monthLabel: string;
}): string {
  const { isCurrentMonth, totalSpent, budget, daysInMonth, todayDate, daysLeft, dailyAllowance, monthLabel } = args;

  if (totalSpent === 0) {
    return isCurrentMonth ? "まだ記録がありません。レシートから始めましょう" : `${monthLabel}の記録はありません`;
  }

  if (!isCurrentMonth) {
    return `${monthLabel}の支出は${formatYen(totalSpent)}でした`;
  }

  if (budget > 0 && totalSpent >= budget) {
    const over = totalSpent - budget;
    return `予算を${formatYen(over)}超えています`;
  }

  const monthProgress = todayDate / daysInMonth;
  const budgetProgress = budget > 0 ? totalSpent / budget : 0;

  if (budgetProgress < monthProgress - 0.10) {
    return `今月は予算内で順調です。1日あたり${formatYen(dailyAllowance)}使えます`;
  }
  if (budgetProgress > monthProgress + 0.15) {
    return `ペースがやや早めです。残り${daysLeft}日`;
  }
  if (budgetProgress > 0.9) {
    return `予算の${Math.round(budgetProgress * 100)}%を使っています`;
  }
  return `残り${daysLeft}日、1日あたり${formatYen(dailyAllowance)}使えます`;
}

export function todayCommentary(amount: number): string {
  if (amount === 0) return "まだ支出はありません";
  if (amount < 500) return "かなり節約できています";
  if (amount < 1500) return "落ち着いたペース";
  if (amount < 3000) return "標準的なペース";
  return "やや使いめです";
}

export function weekCommentary(args: { weekTotal: number; totalSpent: number; daysPassed: number }): string {
  const { weekTotal, totalSpent, daysPassed } = args;
  if (weekTotal === 0) return "まだ支出はありません";
  if (daysPassed < 1 || totalSpent === 0) return "今週はじまったばかり";
  const weeklyAvg = (totalSpent / daysPassed) * 7;
  if (weeklyAvg <= 0) return "";
  if (weekTotal < weeklyAvg * 0.7) return "今週は控えめ";
  if (weekTotal < weeklyAvg * 1.05) return "平均的なペース";
  if (weekTotal < weeklyAvg * 1.3) return "平均よりやや多め";
  return "平均より多めです";
}

export type DayIntensity = "none" | "low" | "mid" | "high";

export function dayIntensity(amount: number, dailyAvg: number): DayIntensity {
  if (amount <= 0) return "none";
  if (dailyAvg <= 0) return "low";
  const r = amount / dailyAvg;
  if (r < 0.6) return "low";
  if (r < 1.4) return "mid";
  return "high";
}
