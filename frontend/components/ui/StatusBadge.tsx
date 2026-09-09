type Status = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  SHIPPED: "bg-blue-100 text-blue-800 border-blue-200",
  CONFIRMED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  PROCESSING: "bg-amber-100 text-amber-800 border-amber-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  PENDING: "bg-purple-100 text-purple-800 border-purple-200",
};

export default function StatusBadge({ status }: { status: Status }) {
  const upper = status?.toUpperCase() || "PENDING";
  const styles = STATUS_STYLES[upper] || STATUS_STYLES.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {upper}
    </span>
  );
}
