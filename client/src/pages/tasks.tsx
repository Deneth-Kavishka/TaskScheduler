import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ═══════════════════════════════════════════════════════════════
 * TASKS PAGE - Main Task Management Interface
 * ═══════════════════════════════════════════════════════════════
 *
 * This page connects to 5 backend algorithms through REST API:
 *
 * 1. FETCH TASKS - GET /api/tasks
 *    → Backend: Array filtering with status detection - O(n)
 *    → Line: 37
 *
 * 2. CREATE TASK - POST /api/tasks
 *    → Algorithm: INSERT (Enqueue) - O(log n)
 *    → Backend: algorithms.ts - PriorityQueue.insert() - Line 97
 *    → Triggers: heapifyUp() to maintain max heap
 *    → Line: 41
 *
 * 3. UPDATE TASK - PUT /api/tasks/:id
 *    → Algorithm: UPDATE PRIORITY - O(log n)
 *    → Backend: algorithms.ts - PriorityQueue.updatePriority() - Line 116
 *    → Triggers: Conditional heapify (up/down based on priority change)
 *    → Line: 50
 *
 * 4. DELETE TASK - DELETE /api/tasks/:id
 *    → Algorithm: EXTRACT MAX - O(log n)
 *    → Backend: algorithms.ts - PriorityQueue.extractMax() - Line 105
 *    → Triggers: heapifyDown() to restore heap
 *    → Line: 62
 *
 * 5. COMPLETE TASK - POST /api/tasks/:id/complete
 *    → Backend: Database update + completion history
 *    → Line: 71
 * ═══════════════════════════════════════════════════════════════
 */
export default function Tasks() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  /**
   * ALGORITHM CONNECTION 1: Fetch All Tasks
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/tasks
   * Backend: server/routes.ts - Line 35
   * Purpose: Retrieves all tasks with auto-detected overdue status
   */
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  /**
   * ALGORITHM CONNECTION 2: Create Task (INSERT/ENQUEUE)
   * ═══════════════════════════════════════════════════════════════
   * API: POST /api/tasks
   * Algorithm: PriorityQueue.insert() - O(log n)
   * Backend: server/algorithms.ts - Line 97
   * Flow:
   *   1. User submits TaskForm
   *   2. Data sent to POST /api/tasks
   *   3. insert() adds task to heap
   *   4. heapifyUp() bubbles task to correct position
   *   5. Database saves, UI refreshes
   */
  const createMutation = useMutation({
    mutationFn: (data: InsertTask) => apiRequest("POST", "/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      setIsCreateOpen(false);
      toast({ title: "Task created successfully" });
    },
  });

  /**
   * ALGORITHM CONNECTION 3: Update Task (UPDATE PRIORITY)
   * ═══════════════════════════════════════════════════════════════
   * API: PUT /api/tasks/:id
   * Algorithm: PriorityQueue.updatePriority() - O(log n)
   * Backend: server/algorithms.ts - Line 116
   * Flow:
   *   1. User edits task in TaskCard dialog
   *   2. Data sent to PUT /api/tasks/:id
   *   3. updatePriority() modifies task
   *   4. Conditional heapify based on priority change:
   *      - If priority increased → heapifyUp()
   *      - If priority decreased → heapifyDown()
   *   5. Heap property maintained, UI updates
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertTask }) =>
      apiRequest("PUT", `/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      setEditingTask(null);
      toast({ title: "Task updated successfully" });
    },
  });

  /**
   * ALGORITHM CONNECTION 4: Delete Task (EXTRACT MAX)
   * ═══════════════════════════════════════════════════════════════
   * API: DELETE /api/tasks/:id
   * Algorithm: PriorityQueue.extractMax() - O(log n)
   * Backend: server/algorithms.ts - Line 105
   * Flow:
   *   1. User clicks delete button on TaskCard
   *   2. DELETE request to /api/tasks/:id
   *   3. extractMax() removes task from heap
   *   4. heapifyDown() restores max heap property
   *   5. Task removed from DB and UI
   */
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Task deleted successfully" });
    },
  });

  /**
   * ALGORITHM CONNECTION 5: Complete Task
   * ═══════════════════════════════════════════════════════════════
   * API: POST /api/tasks/:id/complete
   * Backend: server/routes.ts - Line 159, server/storage.ts
   * Purpose: Marks task complete and saves to completion_history
   * Used by: Analytics algorithm for trend calculation
   */
  const completeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/tasks/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Task completed!", description: "Great work!" });
    },
  });

  const filteredTasks =
    tasks?.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    }) || [];

  const groupedTasks = {
    high: filteredTasks.filter((t) => t.priority === "high"),
    medium: filteredTasks.filter((t) => t.priority === "medium"),
    low: filteredTasks.filter((t) => t.priority === "low"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and organize your tasks by priority
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your priority queue
              </DialogDescription>
            </DialogHeader>
            <TaskForm
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
              isPending={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-tasks"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger
            className="w-full sm:w-40"
            data-testid="select-filter-priority"
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-full sm:w-40"
            data-testid="select-filter-status"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-4">No tasks found</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            data-testid="button-create-first-task"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your Task
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedTasks.high.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-priority-high" />
                High Priority ({groupedTasks.high.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.high.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onComplete={(id) => completeMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedTasks.medium.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-priority-medium" />
                Medium Priority ({groupedTasks.medium.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.medium.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onComplete={(id) => completeMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedTasks.low.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-priority-low" />
                Low Priority ({groupedTasks.low.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedTasks.low.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={setEditingTask}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onComplete={(id) => completeMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and priority
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              task={editingTask}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingTask.id, data })
              }
              onCancel={() => setEditingTask(null)}
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
