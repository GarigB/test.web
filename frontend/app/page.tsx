"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DateBoxes from "./components/DateBoxes";
import ComparisonModal from "./components/ComparisonModal";
import ComparisonTableRow from "./components/ComparisonTableRow";
import type { SaleComparisonItem } from "./types";
import { API_URL, DEFAULT_DATE, DETAIL_PAGE_SIZE } from "./utils/constants";
import { formatMoney } from "./utils/format";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [rows, setRows] = useState<SaleComparisonItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<SaleComparisonItem | null>(
    null
  );
  const [detailPage, setDetailPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBranchForDetail, setSelectedBranchForDetail] = useState<
    string | null
  >(null);
  const [comparisonType, setComparisonType] = useState<number>(1);
  const allDetailItems = useMemo(() => selectedRow?.items ?? [], [selectedRow]);

  function normalizeBranchName(value: string | null | undefined) {
    return value ? value.trim().toLowerCase() : "";
  }
  const activeBranchFilter = useMemo(() => {
    const branch = selectedBranchForDetail?.trim() || "";
    return branch || null;
  }, [selectedBranchForDetail]);

  const detailItems = useMemo(() => {
    const normalizedSelectedBranch = normalizeBranchName(activeBranchFilter);

    if (!normalizedSelectedBranch) {
      return allDetailItems;
    }

    return allDetailItems.filter((detail) => {
      if (!detail.branchName) return false;
      return (
        normalizeBranchName(detail.branchName) === normalizedSelectedBranch
      );
    });
  }, [allDetailItems, activeBranchFilter]);

  const totalDetailPages = detailItems.length
    ? Math.ceil(detailItems.length / DETAIL_PAGE_SIZE)
    : 0;
  const pagedDetails = detailItems.slice(
    detailPage * DETAIL_PAGE_SIZE,
    detailPage * DETAIL_PAGE_SIZE + DETAIL_PAGE_SIZE
  );
  const formattedComparisonDate = new Date(
    `${selectedDate}T00:00:00`
  ).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fetchComparison = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set("date", selectedDate);
      params.set("type", String(comparisonType));

      const response = await fetch(`${API_URL}?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Алдаа гарлаа");
      }

      const body = (await response.json()) as {
        status: boolean;
        message: string;
        data: SaleComparisonItem[];
      };

      if (!body.status) {
        throw new Error(body.message || "Серверийн алдаа");
      }

      const incomingRows = Array.isArray(body.data) ? body.data : [];
      setRows(incomingRows);
    } catch (error) {
      setRows([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Тодорхойгүй алдаа"
      );
    } finally {
      setIsLoading(false);
    }
  }, [comparisonType, selectedDate]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  useEffect(() => {
    if (!selectedRow) {
      return;
    }
    setDetailPage(0);
  }, [selectedRow]);

  function handleSelectRow(row: SaleComparisonItem) {
    setSelectedRow(row);
    setDetailPage(0);
  }

  function handleCloseModal() {
    setSelectedRow(null);
    setDetailPage(0);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-sans dark:bg-black">
      <div className="flex flex-wrap items-stretch gap-4">
        <DateBoxes
          value={selectedDate}
          onChange={setSelectedDate}
          disabled={isLoading}
          className="h-full"
        />

        <div className="relative mt-4 flex h-full items-stretch">
          <div className="flex h-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-gray-800 dark:bg-zinc-900 dark:text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setComparisonType(1);
                  setSelectedBranchForDetail(null);
                }}
                disabled={isLoading}
                className={`rounded-md border px-3 py-2 text-xs font-medium shadow-sm transition ${
                  comparisonType === 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                }`}
              >
                Салбараар
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setComparisonType(0);
                    setSelectedBranchForDetail(null);
                  }}
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md shadow-sm transition ${
                    comparisonType === 0
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "text-gray-600 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:bg-zinc-800 dark:border-gray-700 dark:hover:bg-zinc-700"
                  }`}
                >
                  Төлбөрөөр
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 overflow-x-auto">
        <div className="min-w-[720px] rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-zinc-900">
          <div className="grid grid-cols-5 gap-2 border-b border-gray-200 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>{comparisonType === 1 ? "Industries" : "Payment type"}</span>
            <span>{comparisonType === 1 ? "Payment type" : ""}</span>
            <span className="text-right">History total</span>
            <span className="text-right">Account Balance</span>
            <span className="text-right">Difference</span>
          </div>

          {isLoading ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-300">
              Уншиж байна...
            </p>
          ) : errorMessage ? (
            <p className="py-6 text-center text-sm text-rose-600 dark:text-rose-400">
              {errorMessage}
            </p>
          ) : rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-300">
              Өгөгдөл олдсонгүй.
            </p>
          ) : (
            (() => {
              let displayedRows: SaleComparisonItem[] = [];

              if (comparisonType === 1) {
                const branchMap = new Map<
                  string,
                  {
                    item: SaleComparisonItem;
                    branchName: string;
                    paymentType: number;
                  }
                >();

                rows.forEach((item) => {
                  const branchName = item.branchName;
                  if (!branchName) return;

                  const normalizedBranch = normalizeBranchName(branchName);
                  const key = `${normalizedBranch}-${item.paymentType}`;

                  if (!branchMap.has(key)) {
                    branchMap.set(key, {
                      item,
                      branchName,
                      paymentType: item.paymentType,
                    });
                  }
                });

                const branchValues = Array.from(branchMap.values());
                displayedRows = branchValues.map(({ item }) => item);

                return (
                  <>
                    {branchValues.map(
                      ({ item, branchName, paymentType }, index) => (
                        <ComparisonTableRow
                          key={`${branchName}-${paymentType}-${index}`}
                          item={item}
                          index={index}
                          comparisonType={comparisonType}
                          onSelect={handleSelectRow}
                          selectedBranch={null}
                          branchNameOverride={branchName}
                        />
                      )
                    )}
                    {displayedRows.length > 0 &&
                      (() => {
                        const totalHistory = displayedRows.reduce(
                          (sum, item) => sum + item.historyTransactionAmount,
                          0
                        );
                        const totalApplication = displayedRows.reduce(
                          (sum, item) => sum + item.applicationSaleAmount,
                          0
                        );
                        const totalGap = totalApplication - totalHistory;
                        const gapSign = totalGap >= 0 ? "+" : "-";
                        const gapAmount = Math.abs(totalGap);

                        return (
                          <div className="grid grid-cols-5 gap-2 border-t-2 border-gray-300 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                            <span>Total:</span>
                            <span></span>
                            <span className="text-right font-mono">
                              {formatMoney(totalHistory)}
                            </span>
                            <span className="text-right font-mono">
                              {formatMoney(totalApplication)}
                            </span>
                            <span
                              className={`text-right font-mono ${
                                totalGap >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {gapSign}
                              {formatMoney(gapAmount)}
                            </span>
                          </div>
                        );
                      })()}
                  </>
                );
              } else {
                displayedRows = rows;

                return (
                  <>
                    {rows.map((item, index) => (
                      <ComparisonTableRow
                        key={`${item.paymentType}-${
                          item.branchId || index
                        }-${index}`}
                        item={item}
                        index={index}
                        comparisonType={comparisonType}
                        onSelect={handleSelectRow}
                        selectedBranch={null}
                        branchNameOverride={null}
                      />
                    ))}
                    {displayedRows.length > 0 &&
                      (() => {
                        const totalHistory = displayedRows.reduce(
                          (sum, item) => sum + item.historyTransactionAmount,
                          0
                        );
                        const totalApplication = displayedRows.reduce(
                          (sum, item) => sum + item.applicationSaleAmount,
                          0
                        );
                        const totalGap = totalApplication - totalHistory;
                        const gapSign = totalGap >= 0 ? "+" : "-";
                        const gapAmount = Math.abs(totalGap);

                        return (
                          <div className="grid grid-cols-5 gap-2 border-t-2 border-gray-300 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                            <span>Total:</span>
                            <span></span>
                            <span className="text-right font-mono">
                              {formatMoney(totalHistory)}
                            </span>
                            <span className="text-right font-mono">
                              {formatMoney(totalApplication)}
                            </span>
                            <span
                              className={`text-right font-mono ${
                                totalGap >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-rose-600 dark:text-rose-400"
                              }`}
                            >
                              {gapSign}
                              {formatMoney(gapAmount)}
                            </span>
                          </div>
                        );
                      })()}
                  </>
                );
              }
            })()
          )}
        </div>
      </div>

      {selectedRow && (
        <ComparisonModal
          selectedRow={selectedRow}
          selectedBranchForDetail={selectedBranchForDetail}
          detailItems={detailItems}
          allDetailItems={allDetailItems}
          detailPage={detailPage}
          totalDetailPages={totalDetailPages}
          pagedDetails={pagedDetails}
          formattedComparisonDate={formattedComparisonDate}
          comparisonType={comparisonType}
          onClose={handleCloseModal}
          onPageChange={setDetailPage}
        />
      )}
    </div>
  );
}
