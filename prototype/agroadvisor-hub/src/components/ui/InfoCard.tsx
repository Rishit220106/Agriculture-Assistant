import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  status?: "healthy" | "attention" | "risk";
  className?: string;
}

const statusStyles = {
  healthy: "border-l-status-healthy",
  attention: "border-l-status-attention", 
  risk: "border-l-status-risk",
};

export function InfoCard({ title, value, description, icon: Icon, status, className }: InfoCardProps) {
  return (
    <div className={cn(
      "info-card border-l-4",
      status ? statusStyles[status] : "border-l-primary",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-muted rounded-md">
            <Icon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
