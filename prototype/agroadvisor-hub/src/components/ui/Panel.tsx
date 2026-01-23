import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Panel({ title, children, className, contentClassName }: PanelProps) {
  return (
    <div className={cn("panel", className)}>
      {title && (
        <div className="panel-header">
          <h3 className="panel-title">{title}</h3>
        </div>
      )}
      <div className={cn("panel-content", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
