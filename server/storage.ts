import {
  tasks,
  completionHistory,
  type Task,
  type InsertTask,
  type CompletionHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  completeTask(id: string): Promise<Task | undefined>;
  getCompletionHistory(): Promise<CompletionHistory[]>;
  addCompletionHistory(
    history: Omit<CompletionHistory, "id">
  ): Promise<CompletionHistory>;
}

export class DatabaseStorage implements IStorage {
  /*
    ALGORITHM 7: GET ALL TASKS - O(n)
    Retrieves all tasks from database, ordered by creation date.
    Used by: Build Max Heap, Conflict Detection, Analytics, Recommendations
   */
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  /*
    ALGORITHM 8: GET SINGLE TASK - O(1)
    Fetches one task by ID using B-tree index.
    Used by: Routes for single task display/update
   */
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  /*
    ALGORITHM 9: CREATE TASK - O(1)
    Inserts new task into database.
    Used by: INSERT algorithm (enqueue to priority queue)
   */
  async createTask(insertTask: InsertTask): Promise<Task> {
    const deadlineDate =
      typeof insertTask.deadline === "string"
        ? new Date(insertTask.deadline)
        : insertTask.deadline;

    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        deadline: deadlineDate,
        status: insertTask.status || "pending",
      })
      .returning();
    return task;
  }

  /*
    ALGORITHM 10: UPDATE TASK - O(1)
    Modifies task properties using ID lookup.
    Used by: UPDATE PRIORITY algorithm (heap rebalancing)
   */
  async updateTask(
    id: string,
    updateData: Partial<InsertTask>
  ): Promise<Task | undefined> {
    const updates: any = { ...updateData };

    if (updates.deadline) {
      updates.deadline =
        typeof updates.deadline === "string"
          ? new Date(updates.deadline)
          : updates.deadline;
    }

    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  /*
    ALGORITHM 11: DELETE TASK - O(1)
    Removes task from database by ID.
    Used by: EXTRACT MAX algorithm (dequeue from priority queue)
   */
  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  /*
    ALGORITHM 12: COMPLETE TASK - O(1)
    Marks task as completed and saves to history.
    Updates status, tracks completion time, and records metrics.
    Used by: Analytics algorithm (for completion trend calculation)
   */
  async completeTask(id: string): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;

    const completedAt = new Date();
    const wasOverdue = new Date(task.deadline) < completedAt;
    const actualDuration = task.estimatedDuration;

    await this.addCompletionHistory({
      taskId: task.id,
      taskName: task.name,
      priority: task.priority,
      estimatedDuration: task.estimatedDuration,
      actualDuration,
      completedAt,
      wasOverdue,
    });

    const [updatedTask] = await db
      .update(tasks)
      .set({ status: "completed", completedAt })
      .where(eq(tasks.id, id))
      .returning();

    return updatedTask || undefined;
  }

  /*
    ALGORITHM 13: GET COMPLETION HISTORY - O(n)
    Retrieves all completion records for analytics.
    Used by: Analytics algorithm (7-day trend, completion metrics)
   */
  async getCompletionHistory(): Promise<CompletionHistory[]> {
    return await db
      .select()
      .from(completionHistory)
      .orderBy(desc(completionHistory.completedAt));
  }

  /*
    ALGORITHM 14: ADD COMPLETION HISTORY - O(1)
    Saves task completion record for analytics tracking.
    Used by: completeTask() to maintain historical data
   */
  async addCompletionHistory(
    history: Omit<CompletionHistory, "id">
  ): Promise<CompletionHistory> {
    const [record] = await db
      .insert(completionHistory)
      .values(history)
      .returning();
    return record;
  }
}

export const storage = new DatabaseStorage();
