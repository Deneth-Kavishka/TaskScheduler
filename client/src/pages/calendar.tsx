import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ═══════════════════════════════════════════════════════════════
 * CALENDAR PAGE - Timeline & Deadline View
 * ═══════════════════════════════════════════════════════════════
 *
 * This page connects to 1 backend endpoint with potential sorting:
 *
 * FETCH TASKS - GET /api/tasks
 * → Backend: Array filtering - O(n)
 * → Used for: Displaying tasks on calendar by deadline
 *
 * Optional Algorithm Connection:
 * GET /api/tasks/sorted/deadline - HEAPSORT by Deadline
 * → Algorithm: Heap Sort - O(n log n)
 * → Backend: algorithms.ts - Line 197 (sortTasksByDeadline)
 * → Routes: server/routes.ts - Line 189
 * → Can be used to get chronologically sorted tasks
 *
 * Purpose:
 * - Visualize tasks on weekly/monthly calendar
 * - Show deadline distribution across dates
 * - Help identify busy days and schedule conflicts
 * - Filter tasks by date range
 *
 * Frontend Sorting:
 * - Uses date-fns for date filtering (isSameDay)
 * - Groups tasks by deadline date
 * - Displays in calendar grid format
 * ═══════════════════════════════════════════════════════════════
 */
export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month">("week");

  /**
   * ALGORITHM CONNECTION: Fetch Tasks for Calendar Display
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/tasks
   * Backend: server/routes.ts - Line 35
   * Purpose: Gets all tasks to display on calendar by deadline
   *
   * Data Flow:
   * 1. Fetch all pending tasks from database
   * 2. Frontend filters tasks by date using isSameDay()
   * 3. Groups tasks into calendar grid cells
   * 4. Each day shows count and list of tasks due
   *
   * Alternative (if sorted by deadline needed):
   * - Could use GET /api/tasks/sorted/deadline
   * - Returns tasks pre-sorted chronologically using HeapSort
   * - Time complexity: O(n log n) vs O(n) for unsorted
   *
   * Used for: Week/month view calendar visualization
   */
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || [];

  const getTasksForDay = (date: Date) => {
    return pendingTasks.filter((task) =>
      isSameDay(new Date(task.deadline), date)
    );
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startOfWeek(currentDate), i)
  );

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const navigatePrev = () => {
    if (view === "week") {
      setCurrentDate((prev) => addDays(prev, -7));
    } else {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1)
      );
    }
  };

  const navigateNext = () => {
    if (view === "week") {
      setCurrentDate((prev) => addDays(prev, 7));
    } else {
      setCurrentDate(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1)
      );
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          View your tasks in a timeline format
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={navigatePrev}
            data-testid="button-calendar-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            data-testid="button-calendar-today"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={navigateNext}
            data-testid="button-calendar-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-4">
            <h2
              className="text-xl font-semibold"
              data-testid="text-calendar-title"
            >
              {view === "week"
                ? `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`
                : format(currentDate, "MMMM yyyy")}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            data-testid="button-view-week"
          >
            Week
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            data-testid="button-view-month"
          >
            Month
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : view === "week" ? (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <Card
                key={day.toISOString()}
                className={cn("min-h-64", isToday && "border-primary")}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {format(day, "EEE")}
                  </CardTitle>
                  <CardDescription
                    className={cn(
                      "text-2xl font-bold",
                      isToday && "text-primary"
                    )}
                  >
                    {format(day, "d")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-2 rounded-md text-xs border-l-2",
                        task.priority === "high" &&
                          "border-l-priority-high bg-priority-high/10",
                        task.priority === "medium" &&
                          "border-l-priority-medium bg-priority-medium/10",
                        task.priority === "low" &&
                          "border-l-priority-low bg-priority-low/10"
                      )}
                      data-testid={`calendar-task-${task.id}`}
                    >
                      <p className="font-medium truncate">{task.name}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(task.deadline), "h:mm a")}
                      </p>
                      <p className="text-muted-foreground">
                        {task.estimatedDuration}min
                      </p>
                    </div>
                  ))}
                  {dayTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No tasks
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-24 p-2 border rounded-md hover-elevate",
                      isToday && "border-primary bg-primary/5"
                    )}
                    data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium mb-1",
                        isToday && "text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <Badge
                          key={task.id}
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-xs truncate",
                            task.priority === "high" && "border-priority-high",
                            task.priority === "medium" &&
                              "border-priority-medium",
                            task.priority === "low" && "border-priority-low"
                          )}
                        >
                          {task.name}
                        </Badge>
                      ))}
                      {dayTasks.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{dayTasks.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
