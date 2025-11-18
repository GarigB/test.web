"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DateBoxes from "./components/DateBoxes";
import ComparisonModal from "./components/ComparisonModal";
import ComparisonTableRow from "./components/ComparisonTableRow";
import BranchFilterDropdown from "./components/BranchFilterDropdown";
import PaymentFilterModal from "./components/PaymentFilterModal";
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
  const [showBranchFilterInModal, setShowBranchFilterInModal] = useState(false);
  const [showPaymentFilterModal, setShowPaymentFilterModal] = useState(false);
  const [selectedPaymentForFilter, setSelectedPaymentForFilter] = useState<
    string | null
  >(null);
  const comparisonType = 0;
  const allDetailItems = useMemo(() => selectedRow?.items ?? [], [selectedRow]);
  const detailItems = useMemo(() => {
    // Хэрэв салбар сонгоогүй бол бүх мэдээлэл харуул
    if (!selectedBranchForDetail) {
      return allDetailItems;
    }
    
    // Сонгосон салбарын нэрийг цэвэрлэх
    const selectedBranch = String(selectedBranchForDetail).trim();
    if (selectedBranch === "") {
      return allDetailItems;
    }
    
    // Зөвхөн сонгосон салбарын мэдээллийг filter хийх
    const filtered = allDetailItems.filter((detail) => {
      if (!detail.branchName) return false;
      const detailBranch = String(detail.branchName).trim();
      // Яг ижил байх ёстой
      return detailBranch === selectedBranch;
    });
    
    return filtered;
  }, [allDetailItems, selectedBranchForDetail]);
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
        setShowBranchFilterInModal(false);
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
      <div className="flex flex-wrap items-center gap-4">
        <DateBoxes
          value={selectedDate}
          onChange={setSelectedDate}
          disabled={isLoading}
        />

        <div className="relative">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 mt-4 text-sm shadow-sm dark:border-gray-800 dark:bg-zinc-900 dark:text-white">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Салбарууд
            </p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {allBranches.length}
              </p>
              <BranchFilterDropdown
                selectedBranch={selectedBranchForDetail}
                branches={allBranches}
                showDropdown={showBranchFilterInModal}
                onToggle={() => setShowBranchFilterInModal((prev) => !prev)}
                onSelect={(branch) => {
                  // Салбар сонгох үед state-ийг update хийх
                  setSelectedBranchForDetail(branch);
                  setDetailPage(0);
                }}
                selectedRowItems={selectedRow?.items}
              />
                <button
                  type="button"
                onClick={() => setShowPaymentFilterModal(true)}
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm transition hover:border-gray-400 hover:bg-gray-50 dark:text-gray-300 dark:bg-zinc-800 dark:border-gray-700 dark:hover:bg-zinc-700"
              >
                Төлбөрөөр
                </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Огноо өөрчлөгдөхөд бүх салбарын мэдээлэл шинэчлэгдэнэ.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-10 overflow-x-auto">
        <div className="min-w-[720px] rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-zinc-900">
          <div className="grid grid-cols-5 gap-2 border-b border-gray-200 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>
              {comparisonType === 0 ? "Payment type" : "Industries"}
            </span>
            <span>{comparisonType === 0 ? "" : "Payment type"}</span>
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
            rows
              .filter((item) => {
                // Төлбөрөөр filter хийх
                if (!selectedPaymentForFilter) {
                  return true;
                }
                const itemPaymentName = item.paymentName || `Type ${item.paymentType}`;
                return itemPaymentName === selectedPaymentForFilter;
              })
              .map((item, index) => (
                <ComparisonTableRow
                key={`${item.paymentType}-${item.branchId || index}-${index}`}
                  item={item}
                  index={index}
                  comparisonType={comparisonType}
                  onSelect={handleSelectRow}
                  selectedBranch={selectedBranchForDetail}
                />
              ))
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
          onClose={handleCloseModal}
          onBranchSelect={(branch) => {
            setSelectedBranchForDetail(branch);
            setDetailPage(0);
          }}
          onPageChange={setDetailPage}
          allBranches={allBranches}
          selectedRowItems={selectedRow?.items}
        />
      )}
      <PaymentFilterModal
        isOpen={showPaymentFilterModal}
        onClose={() => setShowPaymentFilterModal(false)}
        payments={rows.map((item) => ({
          paymentName: item.paymentName,
          paymentType: item.paymentType,
        }))}
        selectedPayment={selectedPaymentForFilter}
        onSelect={(payment) => {
          setSelectedPaymentForFilter(payment);
        }}
      />
    </div>
  );
}
