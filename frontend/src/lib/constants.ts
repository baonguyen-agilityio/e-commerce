export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "Pending",
    className: "bg-amber-100/50 text-amber-700 border-amber-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-blue-100/50 text-blue-700 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100/50 text-green-700 border-green-200",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100/50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100/50 text-gray-700 border-gray-200",
  },
};
