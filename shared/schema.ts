import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  deadline: timestamp("deadline").notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
  estimatedDuration: integer("estimated_duration").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  scheduledStart: timestamp("scheduled_start"),
});

export const completionHistory = pgTable("completion_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  taskName: text("task_name").notNull(),
  priority: varchar("priority", { length: 10 }).notNull(),
  estimatedDuration: integer("estimated_duration").notNull(),
  actualDuration: integer("actual_duration"),
  completedAt: timestamp("completed_at").notNull().default(sql`now()`),
  wasOverdue: boolean("was_overdue").notNull().default(false),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  scheduledStart: true,
}).extend({
  deadline: z.string().or(z.date()),
  priority: z.enum(["high", "medium", "low"]),
  estimatedDuration: z.number().int().positive(),
  status: z.enum(["pending", "completed", "overdue"]).optional(),
});

export const updateTaskSchema = insertTaskSchema.partial().extend({
  id: z.string(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type CompletionHistory = typeof completionHistory.$inferSelect;

export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflictingTasks: Task[];
  recommendations: string[];
}

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  productivityScore: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  completionTrend: {
    date: string;
    completed: number;
    overdue: number;
  }[];
}

export interface SmartRecommendation {
  type: "break" | "workload" | "reschedule" | "deadline";
  message: string;
  severity: "info" | "warning" | "critical";
  relatedTasks?: string[];
}

export interface HeapNode {
  task: Task;
  priority: number;
  children: HeapNode[];
}
