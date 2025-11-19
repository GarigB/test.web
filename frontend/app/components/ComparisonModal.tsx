"use client";

import { useMemo } from "react";
import type { SaleComparisonDetail, SaleComparisonItem } from "../types";
import { formatMoney, getGapText } from "../utils/format";

type ComparisonModalProps = {
  selectedRow: SaleComparisonItem;
  selectedBranchForDetail: string | null;
  detailItems: SaleComparisonDetail[];
  allDetailItems: SaleComparisonDetail[];
  detailPage: number;
  totalDetailPages: number;
  pagedDetails: SaleComparisonDetail[];
  formattedComparisonDate: string;
  comparisonType: number;
  onClose: () => void;
  onPageChange: (page: number) => void;
};

export default function ComparisonModal({
  selectedRow,
  selectedBranchForDetail,
  detailItems,
  allDetailItems,
  detailPage,
  totalDetailPages,
  pagedDetails,
  formattedComparisonDate,
  comparisonType,
  onClose,
  onPageChange,
}: ComparisonModalProps) {
  const historyTotal = useMemo(() => {
    if (!selectedBranchForDetail || allDetailItems.length === 0) {
      return selectedRow.historyTransactionAmount;
    }
    if (detailItems.length === 0) {
      return 0;
    }
    return Math.round(
      (selectedRow.historyTransactionAmount * detailItems.length) /
        allDetailItems.length
    );
  }, [
    selectedBranchForDetail,
    allDetailItems.length,
    detailItems.length,
    selectedRow.historyTransactionAmount,
  ]);

  const applicationTotal = useMemo(() => {
    if (!selectedBranchForDetail || allDetailItems.length === 0) {
      return selectedRow.applicationSaleAmount;
    }
    if (detailItems.length === 0) {
      return 0;
    }
    return Math.round(
      (selectedRow.applicationSaleAmount * detailItems.length) /
        allDetailItems.length
    );
  }, [
    selectedBranchForDetail,
    allDetailItems.length,
    detailItems.length,
    selectedRow.applicationSaleAmount,
  ]);

  const gapValue = useMemo(() => {
    if (!selectedBranchForDetail || allDetailItems.length === 0) {
      return getGapText(selectedRow).text;
    }
    const gap = applicationTotal - historyTotal;
    const sign = gap >= 0 ? "+" : "-";
    return `${sign}${formatMoney(Math.abs(gap))}`;
  }, [
    selectedBranchForDetail,
    allDetailItems.length,
    historyTotal,
    applicationTotal,
    selectedRow,
  ]);

  // Industries үед "Бүх салбар" үед эхний салбарын нэрийг авна
  const firstBranchName = useMemo(() => {
    if (comparisonType === 1 && !selectedBranchForDetail && allDetailItems.length > 0) {
      return allDetailItems[0]?.branchName || "Бүх салбар";
    }
    return null;
  }, [comparisonType, selectedBranchForDetail, allDetailItems]);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white/95 p-6 text-sm text-gray-800 shadow-2xl dark:bg-zinc-900/95 dark:text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {comparisonType === 0 ? "Төлбөрийн төрөл" : "Industries"}
            </p>
            <h2 className="text-2xl font-semibold">
              {comparisonType === 0
                ? selectedRow.paymentName || `Type ${selectedRow.paymentType}`
                : selectedBranchForDetail || firstBranchName || "Бүх салбар"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {comparisonType === 0
                ? selectedBranchForDetail || "Бүх салбар"
                : !selectedBranchForDetail
                  ? selectedRow.paymentName || `Type ${selectedRow.paymentType}`
                  : selectedBranchForDetail}{" "}
              · {detailItems.length.toLocaleString("mn-MN")} гүйлгээ
            </p>
          </div>
          <div className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-300">
            <p className="text-sm font-semibold text-gray-700 dark:text-white">
              {formattedComparisonDate}
            </p>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-zinc-800/60">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                History total
              </p>
              <p className="mt-2 text-xl font-semibold">
                {formatMoney(historyTotal)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-zinc-800/60">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Account Balance
              </p>
              <p className="mt-2 text-xl font-semibold">
                {formatMoney(applicationTotal)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-zinc-800/60">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Difference
              </p>
              <p className="mt-2 text-xl font-semibold">{gapValue}</p>
            </div>
          </div>

          {allDetailItems.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                <p>
                  Зөрүүтэй гүйлгээнүүд ({detailItems.length}) · Хуудас{" "}
                  {totalDetailPages ? detailPage + 1 : 0}/
                  {totalDetailPages || 0}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={detailPage === 0}
                    onClick={() => onPageChange(Math.max(detailPage - 1, 0))}
                    className="rounded-md border border-gray-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={detailPage >= totalDetailPages - 1}
                    onClick={() =>
                      onPageChange(
                        Math.min(
                          detailPage + 1,
                          Math.max(totalDetailPages - 1, 0)
                        )
                      )
                    }
                    className="rounded-md border border-gray-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>

              {detailItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-300">
                  Сонгосон салбар дээр зөрүүтэй гүйлгээ олдсонгүй.
                </p>
              ) : (
                <div className="space-y-3">
                  {pagedDetails.map((detail, detailIndex) => (
                    <div
                      key={`${detail.memberSaleId}-${detail.transactionId}-${detailIndex}`}
                      className="rounded-xl border border-gray-100 p-4 text-xs text-gray-700 shadow-sm dark:border-gray-800 dark:bg-zinc-800/40 dark:text-gray-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{detail.branchName}</p>
                        <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold uppercase text-rose-600 dark:bg-rose-400/20 dark:text-rose-200">
                          {detail.mismatchType}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">
                            Date
                          </p>
                          <p className="font-mono">
                            {new Date(detail.date).toLocaleString("mn-MN", {
                              year: "2-digit",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">
                            Sale No
                          </p>
                          <p className="font-mono">{detail.memberSaleNo}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">
                            Transaction
                          </p>
                          <p className="font-mono">{detail.transactionId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-gray-400">
                            Payment type
                          </p>
                          <p className="font-mono">
                            {selectedRow.paymentName || detail.paymentType}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-xs text-gray-500 dark:text-gray-300">
              Нэмэлт задрал байхгүй.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
          <button
            type="button"
            className="rounded-md border border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 transition hover:border-black hover:text-black dark:border-gray-700 dark:text-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
