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
    const left = 2 * index + 1;
    const right = 2 * index + 2;

    if (
      left < length &&
      this.getTaskPriority(this.heap[left]) >
        this.getTaskPriority(this.heap[largest])
    ) {
      largest = left;
    }

    if (
      right < length &&
      this.getTaskPriority(this.heap[right]) >
        this.getTaskPriority(this.heap[largest])
    ) {
      largest = right;
    }

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
    while (index > 0) {
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


