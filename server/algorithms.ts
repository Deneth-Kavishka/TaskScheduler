import { Task } from "@shared/schema";

const PRIORITY_VALUES = { high: 3, medium: 2, low: 1 };

/*
  PRIORITY QUEUE (MAX HEAP)
  Maintains tasks in priority order for efficient scheduling
  Operations: O(log n) insertions/deletions, O(1) peek
 */
export class PriorityQueue {
  private heap: Task[] = [];

  constructor(tasks: Task[] = []) {
    this.heap = [...tasks.filter((t) => t.status === "pending")];
    this.buildMaxHeap();
  }

  /*
    ALGORITHM 1: BUILD MAX HEAP
    Converts array into valid max heap structure - O(n)
   */
  private buildMaxHeap(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.heapifyDown(i);
    }
  }

  /*
    PRIORITY CALCULATION
    Combines priority level + deadline urgency into single score
   */
  private getTaskPriority(task: Task): number {
    const priorityValue =
      PRIORITY_VALUES[task.priority as keyof typeof PRIORITY_VALUES] || 0;
    const deadlineValue = new Date(task.deadline).getTime();
    return priorityValue * 1e15 - deadlineValue;
  }

  /*
    ALGORITHM 2: HEAPIFY DOWN (SINK)
    Restores max heap property by moving element down - O(log n)
   */
  private heapifyDown(index: number): void {
    const length = this.heap.length;
    let largest = index;
    const left = 2 * index + 1; // left child index
    const right = 2 * index + 2; // right child index
    // Compare with left child
    if (
      left < length &&
      this.getTaskPriority(this.heap[left]) > 
        this.getTaskPriority(this.heap[largest])
    ) {
      largest = left;
    }
    // Compare with right child
    if (
      right < length &&
      this.getTaskPriority(this.heap[right]) >
        this.getTaskPriority(this.heap[largest])
    ) {
      largest = right;
    }
    // Swap and continue heapifying down if needed
    if (largest !== index) {
      [this.heap[index], this.heap[largest]] = [
        this.heap[largest],
        this.heap[index],
      ];
      this.heapifyDown(largest);
    }
  }

  /*
    ALGORITHM 3: HEAPIFY UP (BUBBLE)
    Restores max heap property by moving element up - O(log n)
   */
  private heapifyUp(index: number): void {
    while (index > 0) { // while not at root
      const parent = Math.floor((index - 1) / 2);
      if (
        this.getTaskPriority(this.heap[index]) <= 
        this.getTaskPriority(this.heap[parent])
      ) {
        break;
      }
      [this.heap[index], this.heap[parent]] = [
        this.heap[parent],
        this.heap[index],
      ];
      index = parent;
    }
  }

  /*
    ALGORITHM 4: INSERT (ENQUEUE)
    Adds new task to heap and maintains priority - O(log n)
   */
  insert(task: Task): void {
    this.heap.push(task);
    this.heapifyUp(this.heap.length - 1);
  }

  /*
    ALGORITHM 6: EXTRACT MAX (DEQUEUE)
    Removes and returns highest priority task - O(log n)
   */
  extractMax(): Task | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return max;
  }

  /*
    ALGORITHM 5: UPDATE PRIORITY
    Changes task priority and rebalances heap - O(log n)
   */
  updatePriority(taskId: string, newPriority: "high" | "medium" | "low"): void {
    const index = this.heap.findIndex((t) => t.id === taskId);
    if (index === -1) return;

    const oldPriority = this.getTaskPriority(this.heap[index]);
    this.heap[index].priority = newPriority;
    const newPriorityValue = this.getTaskPriority(this.heap[index]);

    if (newPriorityValue > oldPriority) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }
  }

  getTasks(): Task[] {
    return [...this.heap];
  }

  size(): number {
    return this.heap.length;
  }
}

/*
  ALGORITHM 7: CONFLICT DETECTION
  Finds overlapping task schedules using pairwise comparison - O(n²)
 */
export function detectConflicts(tasks: Task[]): {
  hasConflict: boolean;
  conflictingTasks: Task[];
  recommendations: string[];
} {
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const conflicts: Task[] = [];
  const recommendations: string[] = [];

  for (let i = 0; i < pendingTasks.length; i++) {
    for (let j = i + 1; j < pendingTasks.length; j++) {
      const task1 = pendingTasks[i];
      const task2 = pendingTasks[j];

      const start1 =
        new Date(task1.deadline).getTime() - task1.estimatedDuration * 60000;
      const end1 = new Date(task1.deadline).getTime();
      const start2 =
        new Date(task2.deadline).getTime() - task2.estimatedDuration * 60000;
      const end2 = new Date(task2.deadline).getTime();

      if (
        (start1 < end2 && end1 > start2) ||
        (start2 < end1 && end2 > start1)
      ) {
        if (!conflicts.find((t) => t.id === task1.id)) conflicts.push(task1);
        if (!conflicts.find((t) => t.id === task2.id)) conflicts.push(task2);

        if (
          PRIORITY_VALUES[task1.priority as keyof typeof PRIORITY_VALUES] >
          PRIORITY_VALUES[task2.priority as keyof typeof PRIORITY_VALUES]
        ) {
          recommendations.push(
            `Consider rescheduling "${task2.name}" (${task2.priority} priority) as it conflicts with higher priority task "${task1.name}"`
          );
        } else {
          recommendations.push(
            `Consider rescheduling "${task1.name}" (${task1.priority} priority) as it conflicts with higher priority task "${task2.name}"`
          );
        }
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflictingTasks: conflicts,
    recommendations,
  };
}

/*
  ALGORITHM 8: RESCHEDULING
  Finds next available time slot avoiding conflicts - O(n log n)
 */
export function rescheduleTask(task: Task, allTasks: Task[]): Date {
  const taskDuration = task.estimatedDuration * 60000;
  let proposedTime = new Date(task.deadline).getTime();

  const sortedTasks = [...allTasks]
    .filter((t) => t.id !== task.id && t.status === "pending")
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

  for (const existingTask of sortedTasks) {
    const existingStart =
      new Date(existingTask.deadline).getTime() -
      existingTask.estimatedDuration * 60000;
    const existingEnd = new Date(existingTask.deadline).getTime();

    if (
      proposedTime < existingEnd &&
      proposedTime + taskDuration > existingStart
    ) {
      proposedTime = existingEnd + 60000;
    }
  }

  return new Date(proposedTime + taskDuration);
}

/*
  ALGORITHM 9: HEAPSORT (DEADLINE SORTING)
  Sorts tasks by deadline using comparison sort - O(n log n)
 */
export function sortByDeadline(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

/*
  ALGORITHM 10: ANALYTICS CALCULATION
  Computes statistics and trends using single-pass aggregation - O(n)
 */
export function calculateAnalytics(
  tasks: Task[],
  completionHistory: Array<{
    completedAt: Date;
    actualDuration: number | null;
    wasOverdue: boolean;
  }>
): {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
  tasksByPriority: { high: number; medium: number; low: number };
  completionTrend: { date: string; completed: number; overdue: number }[];
} {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.status === "overdue" ||
      (t.status === "pending" && new Date(t.deadline) < new Date())
  ).length;
  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" && new Date(t.deadline) >= new Date()
  ).length;

  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const durations = completionHistory
    .map((h) => h.actualDuration)
    .filter((d): d is number => d !== null);
  const averageCompletionTime =
    durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

  const productivityScore =
    completionRate * (1 - overdueTasks / Math.max(totalTasks, 1)) * 100;

  const tasksByPriority = {
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const completionTrend = last7Days.map((date) => {
    const dayHistory = completionHistory.filter(
      (h) => new Date(h.completedAt).toISOString().split("T")[0] === date
    );
    return {
      date,
      completed: dayHistory.filter((h) => !h.wasOverdue).length,
      overdue: dayHistory.filter((h) => h.wasOverdue).length,
    };
  });

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    pendingTasks,
    completionRate,
    averageCompletionTime,
    productivityScore,
    tasksByPriority,
    completionTrend,
  };
}

/*
  ALGORITHM 11: RECOMMENDATION ENGINE
  Generates intelligent task suggestions using heuristic analysis - O(n)
 */
export function generateRecommendations(
  tasks: Task[],
  completionHistory: Array<{ completedAt: Date }>
): Array<{
  type: "break" | "workload" | "reschedule" | "deadline";
  message: string;
  severity: "info" | "warning" | "critical";
  relatedTasks?: string[];
}> {
  const recommendations: Array<{
    type: "break" | "workload" | "reschedule" | "deadline";
    message: string;
    severity: "info" | "warning" | "critical";
    relatedTasks?: string[];
  }> = [];

  const recentCompletions = completionHistory.filter((h) => {
    const hoursSince =
      (Date.now() - new Date(h.completedAt).getTime()) / 3600000;
    return hoursSince <= 2;
  });

  const totalMinutesWorked = recentCompletions.length * 30;

  if (totalMinutesWorked >= 90) {
    recommendations.push({
      type: "break",
      message: `You've been working for ${Math.round(
        totalMinutesWorked
      )} minutes. Consider taking a 10-15 minute break to maintain productivity.`,
      severity: "info",
    });
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === "high");

  if (highPriorityTasks.length >= 5) {
    recommendations.push({
      type: "workload",
      message: `You have ${highPriorityTasks.length} high-priority tasks. Consider rescheduling some medium or low-priority tasks to focus on critical work.`,
      severity: "warning",
      relatedTasks: highPriorityTasks.slice(0, 3).map((t) => t.id),
    });
  }

  const upcomingDeadlines = pendingTasks.filter((t) => {
    const hoursUntil = (new Date(t.deadline).getTime() - Date.now()) / 3600000;
    return hoursUntil <= 24 && hoursUntil > 0;
  });

  if (upcomingDeadlines.length > 0) {
    recommendations.push({
      type: "deadline",
      message: `You have ${upcomingDeadlines.length} task(s) due within 24 hours. Make sure to prioritize these tasks.`,
      severity: upcomingDeadlines.length > 3 ? "critical" : "warning",
      relatedTasks: upcomingDeadlines.map((t) => t.id),
    });
  }

  const conflicts = detectConflicts(tasks);
  if (conflicts.hasConflict) {
    recommendations.push({
      type: "reschedule",
      message: `You have ${conflicts.conflictingTasks.length} tasks with scheduling conflicts. Review and reschedule to optimize your time.`,
      severity: "warning",
      relatedTasks: conflicts.conflictingTasks.slice(0, 3).map((t) => t.id),
    });
  }

  return recommendations;
}
