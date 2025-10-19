import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { HeapVisualization } from "@/components/heap-visualization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ═══════════════════════════════════════════════════════════════
 * HEAP VISUALIZATION PAGE - Priority Queue Binary Tree Display
 * ═══════════════════════════════════════════════════════════════
 *
 * This page connects to 1 backend endpoint with heap operations:
 *
 * FETCH TASKS - GET /api/tasks
 * → Backend: Array filtering - O(n)
 * → Used for: Building visual heap representation
 *
 * Purpose:
 * - Visualizes the Priority Queue (Max Heap) data structure
 * - Shows parent-child relationships in binary tree format
 * - Demonstrates heap property: parent priority ≥ child priority
 * - Educational: helps understand how the heap maintains task ordering
 *
 * Related Algorithms (visualized, not directly called):
 * 1. BUILD MAX HEAP - O(n) - Initial heap construction
 * 2. HEAPIFY DOWN - O(log n) - Maintains heap property downwards
 * 3. HEAPIFY UP - O(log n) - Maintains heap property upwards
 *
 * The heap structure shown here is maintained by:
 * - INSERT (enqueue) algorithm when adding tasks
 * - EXTRACT MAX (dequeue) algorithm when removing highest priority
 * - UPDATE PRIORITY algorithm when changing task importance
 * ═══════════════════════════════════════════════════════════════
 */
export default function Heap() {
  /**
   * ALGORITHM CONNECTION: Fetch Tasks for Heap Display
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/tasks
   * Backend: server/routes.ts - Line 35
   * Purpose: Gets all tasks to visualize heap structure
   *
   * Data Flow:
   * 1. Fetch all tasks from database
   * 2. Tasks are already stored in priority order (maintained by heap)
   * 3. Frontend builds visual tree representation:
   *    - Root: Highest priority task (heap[0])
   *    - Level 1: heap[1], heap[2]
   *    - Level 2: heap[3], heap[4], heap[5], heap[6]
   *    - Formula: parent = floor((i-1)/2), children = 2i+1, 2i+2
   * 4. Component renders binary tree with connecting lines
   *
   * Heap Property Maintained:
   * - Every parent has priority ≥ children's priority
   * - This ensures highest priority task is always at root
   */
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Priority Queue Visualization
        </h1>
        <p className="text-muted-foreground">
          Interactive heap data structure showing task prioritization
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <HeapVisualization tasks={tasks || []} />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Algorithm Info</CardTitle>
              <CardDescription>8 Core Algorithms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Badge variant="outline" className="mb-2">
                  O(log n)
                </Badge>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">1. Task Insertion</p>
                  <p className="font-medium">2. Heapify</p>
                  <p className="font-medium">3. Task Removal</p>
                  <p className="font-medium">8. Priority Update</p>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  O(n)
                </Badge>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">4. Conflict Detection</p>
                  <p className="font-medium">7. Analytics</p>
                </div>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">
                  O(n log n)
                </Badge>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">5. Rescheduling</p>
                  <p className="font-medium">6. Deadline Sorting</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Heap Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">Type</p>
                <p className="text-muted-foreground">Max Heap</p>
              </div>
              <div>
                <p className="font-medium mb-1">Priority Order</p>
                <p className="text-muted-foreground">
                  High {">"} Medium {">"} Low
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Secondary Sort</p>
                <p className="text-muted-foreground">Earlier deadline first</p>
              </div>
              <div>
                <p className="font-medium mb-1">Pending Tasks</p>
                <p className="text-muted-foreground font-mono">
                  {pendingTasks.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p>
                The priority queue uses a max heap data structure to ensure the
                highest priority task is always at the root.
              </p>
              <p>
                When a new task is added, it's inserted at the end and "bubbles
                up" to maintain heap order.
              </p>
              <p>
                Completing a task removes the root and reorganizes the heap
                automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
