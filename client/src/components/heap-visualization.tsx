import { Task } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/priority-badge";

interface HeapNode {
  task: Task;
  priority: number;
  left?: HeapNode;
  right?: HeapNode;
}

interface HeapVisualizationProps {
  tasks: Task[];
}

function buildMaxHeap(tasks: Task[]): HeapNode | null {
  if (tasks.length === 0) return null;

  const priorityMap = { high: 3, medium: 2, low: 1 };
  
  const sortedTasks = [...tasks]
    .filter(t => t.status === "pending")
    .sort((a, b) => {
      const aPriority = priorityMap[a.priority as keyof typeof priorityMap] || 0;
      const bPriority = priorityMap[b.priority as keyof typeof priorityMap] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  if (sortedTasks.length === 0) return null;

  function buildTree(index: number): HeapNode | undefined {
    if (index >= sortedTasks.length) return undefined;
    
    const task = sortedTasks[index];
    const priority = priorityMap[task.priority as keyof typeof priorityMap] || 0;
    
    return {
      task,
      priority,
      left: buildTree(2 * index + 1),
      right: buildTree(2 * index + 2),
    };
  }

  return buildTree(0) || null;
}

function HeapNodeComponent({ node, level = 0 }: { node: HeapNode; level?: number }) {
  const hasChildren = node.left || node.right;

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "px-4 py-2 rounded-lg border-2 min-w-[180px] hover-elevate transition-all",
          node.task.priority === "high" && "border-priority-high bg-priority-high/10",
          node.task.priority === "medium" && "border-priority-medium bg-priority-medium/10",
          node.task.priority === "low" && "border-priority-low bg-priority-low/10"
        )}
        data-testid={`heap-node-${node.task.id}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-xs text-muted-foreground">#{level}</span>
          <PriorityBadge priority={node.task.priority as "high" | "medium" | "low"} />
        </div>
        <p className="font-medium text-sm truncate" title={node.task.name}>
          {node.task.name}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {node.task.estimatedDuration}min
        </p>
      </div>

      {hasChildren && (
        <div className="flex gap-8 mt-4">
          <div className="flex flex-col items-center">
            {node.left && (
              <>
                <div className="h-8 w-0.5 bg-border" />
                <HeapNodeComponent node={node.left} level={level * 2 + 1} />
              </>
            )}
          </div>
          <div className="flex flex-col items-center">
            {node.right && (
              <>
                <div className="h-8 w-0.5 bg-border" />
                <HeapNodeComponent node={node.right} level={level * 2 + 2} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeapVisualization({ tasks }: HeapVisualizationProps) {
  const heap = buildMaxHeap(tasks);

  if (!heap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Priority Queue (Max Heap)</CardTitle>
          <CardDescription>No pending tasks in the queue</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Add tasks to see the heap visualization</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Queue (Max Heap)</CardTitle>
        <CardDescription>
          Tasks organized by priority and deadline. Root node has highest priority.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-8">
        <div className="flex justify-center min-w-max px-4">
          <HeapNodeComponent node={heap} level={0} />
        </div>
      </CardContent>
    </Card>
  );
}
