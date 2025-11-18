"use client";

type BranchFilterDropdownProps = {
  selectedBranch: string | null;
  branches: string[];
  showDropdown: boolean;
  onToggle: () => void;
  onSelect: (branch: string | null) => void;
  selectedRowItems?: Array<{ branchName: string }>;
};

export default function BranchFilterDropdown({
  selectedBranch,
  branches,
  showDropdown,
  onToggle,
  onSelect,
  selectedRowItems,
}: BranchFilterDropdownProps) {
  const availableBranches = selectedRowItems
    ? Array.from(
        new Set(selectedRowItems.map((item) => item.branchName))
      ).filter((name) => name)
    : branches;

  return (
    <div className="relative filter-dropdown">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
      >
        {selectedBranch || "Бүх салбар"}
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
              selectedBranch === null
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300"
            }`}
          >
            Бүх салбар
          </button>
          {availableBranches.map((name) => (
            <button
              key={name}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // Салбар сонгох үед callback дуудах
                onSelect(name);
                onToggle();
              }}
              className={`mb-1 w-full rounded px-2 py-1 text-left ${
                selectedBranch === name
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

