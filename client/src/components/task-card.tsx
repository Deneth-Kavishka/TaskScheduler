import { Task } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/priority-badge";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const isOverdue = isPast(new Date(task.deadline)) && task.status === "pending";
  const isCompleted = task.status === "completed";

  return (
    <Card
      className={cn(
        "hover-elevate transition-all duration-200",
        task.priority === "high" && "border-l-4 border-l-priority-high",
        task.priority === "medium" && "border-l-4 border-l-priority-medium",
        task.priority === "low" && "border-l-4 border-l-priority-low",
        isCompleted && "opacity-60"
      )}
      data-testid={`card-task-${task.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-base mb-1",
                isCompleted && "line-through text-muted-foreground"
              )}
              data-testid={`text-task-name-${task.id}`}
            >
              {task.name}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <PriorityBadge priority={task.priority as "high" | "medium" | "low"} />
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className={cn(isOverdue && "text-destructive font-medium")}>
            {format(new Date(task.deadline), "MMM dd, yyyy 'at' hh:mm a")}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="ml-auto">
              Overdue
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{task.estimatedDuration} minutes</span>
          <span className="ml-auto">
            {formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t">
        {!isCompleted && onComplete && (
          <Button
            size="sm"
            variant="default"
            onClick={() => onComplete(task.id)}
            className="flex-1"
            data-testid={`button-complete-${task.id}`}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Complete
          </Button>
        )}
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(task)}
            data-testid={`button-edit-${task.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(task.id)}
            data-testid={`button-delete-${task.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
