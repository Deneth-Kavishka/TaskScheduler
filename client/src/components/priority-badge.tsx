import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "high" | "medium" | "low";
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        priority === "high" && "border-priority-high text-priority-high",
        priority === "medium" && "border-priority-medium text-priority-medium",
        priority === "low" && "border-priority-low text-priority-low",
        className
      )}
      data-testid={`badge-priority-${priority}`}
    >
      {priority.toUpperCase()}
    </Badge>
  );
}
