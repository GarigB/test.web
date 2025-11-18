"use client";

import { useMemo } from "react";
import type { SaleComparisonItem } from "../types";
import { formatMoney } from "../utils/format";

type ComparisonTableRowProps = {
  item: SaleComparisonItem;
  index: number;
  comparisonType: number;
  onSelect: (row: SaleComparisonItem) => void;
  selectedBranch?: string | null;
};

export default function ComparisonTableRow({
  item,
  index,
  comparisonType,
  onSelect,
  selectedBranch,
}: ComparisonTableRowProps) {
  const displayValue = item.paymentName || String(item.paymentType);
  const totalDetails = item.items?.length ?? 0;

  const branchDetails = useMemo(() => {
    if (!selectedBranch) {
      return totalDetails;
    }
    const trimmed = selectedBranch.trim();
    if (!trimmed) {
      return totalDetails;
    }
    return (
      item.items?.filter((detail) => detail.branchName?.trim() === trimmed)
        .length ?? 0
    );
  }, [item.items, selectedBranch, totalDetails]);

  const historyTotal = useMemo(() => {
    if (!selectedBranch || totalDetails === 0) {
      return item.historyTransactionAmount;
    }
    if (branchDetails === 0) {
      return 0;
    }
    return Math.round(
      (item.historyTransactionAmount * branchDetails) / totalDetails
    );
  }, [
    selectedBranch,
    totalDetails,
    branchDetails,
    item.historyTransactionAmount,
  ]);

  const applicationTotal = useMemo(() => {
    if (!selectedBranch || totalDetails === 0) {
      return item.applicationSaleAmount;
    }
    if (branchDetails === 0) {
      return 0;
    }
    return Math.round(
      (item.applicationSaleAmount * branchDetails) / totalDetails
    );
  }, [
    selectedBranch,
    totalDetails,
    branchDetails,
    item.applicationSaleAmount,
  ]);

  const gapDifference = useMemo(() => {
    const gap = applicationTotal - historyTotal;
    const sign = gap >= 0 ? "+" : "-";
    return {
      sign,
      text: formatMoney(Math.abs(gap)),
      positive: gap >= 0,
    };
  }, [applicationTotal, historyTotal]);

  return (
    <div
      key={`${item.paymentType}-${item.branchId || index}-${index}`}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      className="grid grid-cols-5 gap-2 py-3 text-sm text-gray-700 transition cursor-pointer hover:bg-gray-50 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800/50 dark:focus:bg-zinc-800/60"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item);
        }
      }}
    >
      <span className="font-medium text-gray-900 dark:text-white">
        {displayValue}
      </span>
      <span className="text-gray-500 dark:text-gray-300"></span>
      <span className="text-right font-mono">
        {formatMoney(historyTotal)}
      </span>
      <span className="text-right font-mono">
        {formatMoney(applicationTotal)}
      </span>
      <span
        className={`text-right font-mono ${
          gapDifference.positive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        }`}
      >
        {gapDifference.sign}
        {gapDifference.text}
      </span>
    </div>
  );
}

