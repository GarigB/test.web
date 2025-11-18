import type { SaleComparisonItem } from "../types";

export function formatMoney(value: number): string {
  return "₮ " + value.toLocaleString("mn-MN");
}

export function getGapText(item: SaleComparisonItem) {
  const gap =
    typeof item.gap === "number"
      ? item.gap
      : item.applicationSaleAmount - item.historyTransactionAmount;
  const sign = gap >= 0 ? "+" : "-";
  return {
    sign,
    text: formatMoney(Math.abs(gap)),
    positive: gap >= 0,
  };
}

