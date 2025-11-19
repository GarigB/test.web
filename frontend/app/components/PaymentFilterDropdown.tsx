"use client";

type PaymentFilterDropdownProps = {
  selectedPayment: string | null;
  payments: string[];
  showDropdown: boolean;
  onToggle: () => void;
  onSelect: (payment: string | null) => void;
};

export default function PaymentFilterDropdown({
  selectedPayment,
  payments,
  showDropdown,
  onToggle,
  onSelect,
}: PaymentFilterDropdownProps) {
  return (
    <div className="relative filter-dropdown">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
      >
        {selectedPayment || "Бүгд"}
      </button>
      {showDropdown && (
        <div
          className="absolute left-0 top-full z-50 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg dark:border-gray-800 dark:bg-zinc-900 filter-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              onToggle();
            }}
            className={`mb-1 w-full rounded px-2 py-1 text-left ${
              selectedPayment === null
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300"
            }`}
          >
            Бүгд
          </button>
          {payments.map((name) => (
            <button
              key={name}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSelect(name);
                onToggle();
              }}
              className={`mb-1 w-full rounded px-2 py-1 text-left ${
                selectedPayment === name
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
