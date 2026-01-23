import { cn } from "@/lib/utils";

type StatusLevel = "healthy" | "attention" | "risk" | "low" | "medium" | "high";

interface StatusBadgeProps {
  status: StatusLevel;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusLevel, { bg: string; text: string; defaultLabel: string }> = {
  healthy: { bg: "bg-status-healthy-bg", text: "text-status-healthy", defaultLabel: "Healthy" },
  low: { bg: "bg-status-healthy-bg", text: "text-status-healthy", defaultLabel: "Low" },
  attention: { bg: "bg-status-attention-bg", text: "text-status-attention", defaultLabel: "Attention Required" },
  medium: { bg: "bg-status-attention-bg", text: "text-status-attention", defaultLabel: "Medium" },
  risk: { bg: "bg-status-risk-bg", text: "text-status-risk", defaultLabel: "High Risk" },
  high: { bg: "bg-status-risk-bg", text: "text-status-risk", defaultLabel: "High" },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      {label || config.defaultLabel}
    </span>
  );
}
