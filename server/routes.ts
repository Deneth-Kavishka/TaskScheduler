import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import {
  //detectConflicts,
  calculateAnalytics,
  //generateRecommendations,
  PriorityQueue,
  //rescheduleTask,
  //sortByDeadline,
} from "./algorithms";

export async function registerRoutes(app: Express): Promise<Server> {
  
  /*
    GET /api/tasks - Fetch all tasks with status detection - O(n)
    Used by: tasks.tsx, dashboard.tsx, calendar.tsx, heap.tsx
   */
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();

      const updatedTasks = tasks.map((task) => {
        if (task.status === "pending" && new Date(task.deadline) < new Date()) {
          return { ...task, status: "overdue" as const };
        }
        return task;
      });

      res.json(updatedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  /*
    GET /api/tasks/:id - Fetch single task by ID - O(1)
    Uses B-tree index on primary key
   */
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });

   /**
    ALGORITHM 10: ANALYTICS CALCULATION - Compute task metrics - O(n)
    Algorithm: calculateAnalytics() in algorithms.ts Line 229
    Used by: analytics.tsx Line 24, dashboard.tsx Line 17
   */
  app.get("/api/analytics", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      const history = await storage.getCompletionHistory();

      const analytics = calculateAnalytics(tasks, history);
      res.json(analytics);
    } catch (error) {
      console.error("Error calculating analytics:", error);
      res.status(500).json({ error: "Failed to calculate analytics" });
    }
  });

  /*
    ALGORITHMS 1-3: PRIORITY QUEUE (MAX HEAP) - Build heap & maintain properties - O(n) build, O(log n) ops
    Algorithms: buildMaxHeap() Line 22, heapifyDown() Line 48, heapifyUp() Line 79 in algorithms.ts
    Used by: heap.tsx Line 10, heap-visualization.tsx
   */
  app.get("/api/priority-queue", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      const pq = new PriorityQueue(tasks);

      res.json({
        size: pq.size(),
        tasks: pq.getTasks(),
      });
    } catch (error) {
      console.error("Error fetching priority queue:", error);
      res.status(500).json({ error: "Failed to fetch priority queue" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

/**
   * GET /api/conflicts
   **/ 
app.get("/api/conflicts", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      const conflicts = detectConflicts(tasks);
      res.json(conflicts);
    } catch (error) {
      console.error("Error detecting conflicts:", error);
      res.status(500).json({ error: "Failed to detect conflicts" });
    }
  });


  /**
   *  POST /api/tasks/:id/reschedule
   **/ 
   app.post("/api/tasks/:id/reschedule", async (req, res) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const allTasks = await storage.getAllTasks();
      const newDeadline = rescheduleTask(task, allTasks);

      // Update the task with new deadline
      const updatedTask = await storage.updateTask(req.params.id, {
        deadline: newDeadline,
      });

      res.json({
        task: updatedTask,
        newDeadline,
        message: "Task successfully rescheduled to avoid conflicts",
      });
    } catch (error) {
      console.error("Error rescheduling task:", error);
      res.status(500).json({ error: "Failed to reschedule task" });
    }
  });


   /**
   *   GET /api/tasks/sorted/deadline
   **/ 
  app.get("/api/tasks/sorted/deadline", async (req, res) => {
    try {
      const tasks = await storage.getAllTasks();
      const sortedTasks = sortByDeadline(tasks);

      res.json(sortedTasks);
    } catch (error) {
      console.error("Error sorting tasks:", error);
      res.status(500).json({ error: "Failed to sort tasks" });
    }
  });