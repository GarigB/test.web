"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DateBoxes from "./components/DateBoxes";
import ComparisonModal from "./components/ComparisonModal";
import ComparisonTableRow from "./components/ComparisonTableRow";
import type { SaleComparisonItem } from "./types";
import { API_URL, DEFAULT_DATE, DETAIL_PAGE_SIZE } from "./utils/constants";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(DEFAULT_DATE);
  const [rows, setRows] = useState<SaleComparisonItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<SaleComparisonItem | null>(
    null
  );
  const [detailPage, setDetailPage] = useState(0);
  const [allBranches, setAllBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBranchForDetail, setSelectedBranchForDetail] = useState<
    string | null
  >(null);
  const [comparisonType, setComparisonType] = useState<number>(0);
  const [selectedBranchForTableFilter, setSelectedBranchForTableFilter] = useState<
    string | null
  >(null);
  const [showBranchFilterDropdown, setShowBranchFilterDropdown] = useState(false);
  const allDetailItems = useMemo(() => selectedRow?.items ?? [], [selectedRow]);

  function normalizeBranchName(value: string | null | undefined) {
    return value ? value.trim().toLowerCase() : "";
  }
  const activeBranchFilter = useMemo(() => {
    const branch =
      selectedBranchForTableFilter?.trim() || selectedBranchForDetail?.trim() || "";
    return branch || null;
  }, [selectedBranchForDetail, selectedBranchForTableFilter]);

  const detailItems = useMemo(() => {
    const normalizedSelectedBranch = normalizeBranchName(activeBranchFilter);

    if (!normalizedSelectedBranch) {
      return allDetailItems;
    }

    return allDetailItems.filter((detail) => {
      if (!detail.branchName) return false;
      return normalizeBranchName(detail.branchName) === normalizedSelectedBranch;
    });
  }, [allDetailItems, activeBranchFilter]);

  const selectedBranchForRows = useMemo(() => {
    return selectedBranchForTableFilter?.trim() || null;
  }, [selectedBranchForTableFilter]);
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

      const newBranchNames = new Set<string>();
      incomingRows.forEach((item) => {
        item.items?.forEach((detail) => {
          if (detail.branchName) {
            newBranchNames.add(detail.branchName);
          }
        });
      });

      if (newBranchNames.size > 0) {
        setAllBranches((prev) => {
          const merged = new Set(prev);
          newBranchNames.forEach((name) => merged.add(name));
          return Array.from(merged);
        });
      }
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest(".filter-dropdown")) {
        setShowBranchFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
                  setComparisonType(0);
                  setSelectedBranchForDetail(null);
                  setSelectedBranchForTableFilter(null);
                  setShowBranchFilterDropdown(false);
                }}
                disabled={isLoading}
                className={`rounded-md border px-3 py-2 text-xs font-medium shadow-sm transition ${
                  comparisonType === 0
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
                }`}
              >
                Бүх салбарын нийт
              </button>
              <div className="relative filter-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setComparisonType(1);
                    setSelectedBranchForDetail(null);
                    if (comparisonType === 1) {
                      setShowBranchFilterDropdown((prev) => !prev);
                    } else {
                      setSelectedBranchForTableFilter(null);
                    }
                  }}
                  disabled={isLoading}
                  className={`inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md shadow-sm transition ${
                    comparisonType === 1
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "text-gray-600 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:bg-zinc-800 dark:border-gray-700 dark:hover:bg-zinc-700"
                  }`}
                >
                  Салбараар хайх
                </button>
                {comparisonType === 1 && showBranchFilterDropdown && (
                  <div
                    className="absolute left-0 top-full z-50 mt-2 max-h-44 min-w-[190px] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg ring-1 ring-black/5 dark:border-gray-800 dark:bg-zinc-900 filter-dropdown"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allBranches.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setSelectedBranchForTableFilter(name.trim());
                          setShowBranchFilterDropdown(false);
                        }}
                        className={`mb-1 w-full rounded-lg px-3 py-1.5 text-left transition ${
                          selectedBranchForTableFilter === name
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 overflow-x-auto">
        <div className="min-w-[720px] rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-zinc-900">
          {comparisonType === 1 && !selectedBranchForTableFilter ? (
            <p className="py-14 text-center text-sm font-medium text-blue-700 dark:text-blue-300">
              Та салбар сонгоогүй байна.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-2 border-b border-gray-200 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <span>
                  {comparisonType === 0 ? "Payment type" : "Industries"}
                </span>
                <span>
                  {comparisonType === 1 && "Payment type"}
                </span>
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
                  if (comparisonType === 1) {
                    if (selectedBranchForTableFilter) {
                      const normalizedFilter = normalizeBranchName(
                        selectedBranchForTableFilter
                      );
                      const filteredRows = rows.filter((item) =>
                        item.items?.some(
                          (detail) =>
                            normalizeBranchName(detail.branchName) === normalizedFilter
                        )
                      );

                      const uniquePaymentTypes = new Map<
                        string,
                        { item: SaleComparisonItem; branchName: string }
                      >();
                      filteredRows.forEach((item) => {
                        const paymentKey = `${item.paymentType}-${item.paymentName || ""}`;
                        if (!uniquePaymentTypes.has(paymentKey)) {
                          uniquePaymentTypes.set(paymentKey, {
                            item,
                            branchName: selectedBranchForTableFilter,
                          });
                        }
                      });

                      return Array.from(uniquePaymentTypes.values()).map(
                        ({ item, branchName }, index) => (
                          <ComparisonTableRow
                            key={`${item.paymentType}-${item.branchId || index}-${index}`}
                            item={item}
                            index={index}
                            comparisonType={comparisonType}
                            onSelect={handleSelectRow}
                            selectedBranch={selectedBranchForRows}
                            branchNameOverride={branchName}
                          />
                        )
                      );
                    }

                    const branchMap = new Map<
                      string,
                      { item: SaleComparisonItem; branchName: string }
                    >();
                    rows.forEach((item) => {
                      const firstBranch = item.items?.[0]?.branchName;
                      const normalizedFirstBranch = normalizeBranchName(firstBranch);
                      if (normalizedFirstBranch && !branchMap.has(normalizedFirstBranch)) {
                        branchMap.set(normalizedFirstBranch, {
                          item,
                          branchName: firstBranch || "",
                        });
                      }
                    });

                    return Array.from(branchMap.values()).map(
                      ({ item, branchName }, index) => (
                        <ComparisonTableRow
                          key={`${branchName || "branch"}-${index}`}
                          item={item}
                          index={index}
                          comparisonType={comparisonType}
                          onSelect={handleSelectRow}
                          selectedBranch={selectedBranchForRows}
                          branchNameOverride={branchName}
                        />
                      )
                    );
                  } else {
                    return rows
                      .filter((item) => {
                        if (!selectedBranchForTableFilter) {
                          return true;
                        }
                        const normalizedFilter = normalizeBranchName(
                          selectedBranchForTableFilter
                        );
                        const branchNames = new Set<string>();
                        item.items?.forEach((detail) => {
                          if (detail.branchName) {
                            branchNames.add(normalizeBranchName(detail.branchName));
                          }
                        });
                        return branchNames.has(normalizedFilter);
                      })
                      .map((item, index) => (
                        <ComparisonTableRow
                          key={`${item.paymentType}-${item.branchId || index}-${index}`}
                          item={item}
                          index={index}
                          comparisonType={comparisonType}
                          onSelect={handleSelectRow}
                          selectedBranch={selectedBranchForRows}
                          branchNameOverride={selectedBranchForRows || undefined}
                        />
                      ));
                  }
                })()
              )}
            </>
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
