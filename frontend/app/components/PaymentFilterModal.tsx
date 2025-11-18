"use client";

import { useMemo } from "react";

type PaymentFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  payments: Array<{ paymentName: string | null; paymentType: number }>;
  selectedPayment: string | null;
  onSelect: (payment: string | null) => void;
};

export default function PaymentFilterModal({
  isOpen,
  onClose,
  payments,
  selectedPayment,
  onSelect,
}: PaymentFilterModalProps) {
  const paymentList = useMemo(() => {
    const seen = new Set<string>();
    return payments
      .map((item) => item.paymentName || `Type ${item.paymentType}`)
      .filter((name) => {
        if (seen.has(name)) {
          return false;
        }
        seen.add(name);
        return true;
      });
  }, [payments]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-sm text-gray-800 shadow-2xl dark:bg-zinc-900 dark:text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Төлбөрөөр шүүх
            </p>
            <h3 className="text-xl font-semibold">Төлбөрийн төрлүүд</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 transition hover:border-gray-900 hover:text-gray-900 dark:border-gray-700 dark:text-gray-200"
          >
            Close
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Доорх жагсаалт нь одоогийн хүснэгтэд байгаа төлбөрийн төрлийг харуулна.
        </p>

        <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
          {paymentList.length === 0 ? (
            <p className="text-center text-xs text-gray-500 dark:text-gray-300">
              Харуулах төлбөрийн төрөл алга.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  onSelect(null);
                  onClose();
                }}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                  selectedPayment === null
                    ? "border-gray-900 bg-black text-white dark:border-gray-100 dark:bg-white dark:text-black"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                Бүх төлбөр
              </button>
              {paymentList.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onSelect(name);
                    onClose();
                  }}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                    selectedPayment === name
                      ? "border-gray-900 bg-black text-white dark:border-gray-100 dark:bg-white dark:text-black"
                      : "border-gray-100 bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


