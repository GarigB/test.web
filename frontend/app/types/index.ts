export type SaleComparisonDetail = {
  branchId: string;
  memberSaleId: string;
  date: string;
  branchName: string;
  memberSaleNo: string;
  transactionId: string;
  paymentType: number;
  mismatchType: string;
  terminalId: string | null;
};

export type SaleComparisonItem = {
  branchId: string;
  paymentType: number;
  paymentName: string | null;
  applicationSaleAmount: number;
  historyTransactionAmount: number;
  gap: number;
  items: SaleComparisonDetail[];
};

