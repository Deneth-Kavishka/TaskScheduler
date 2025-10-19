import { useQuery } from "@tanstack/react-query";
import { Task, AnalyticsData, SmartRecommendation } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskCard } from "@/components/task-card";
import { RecommendationPanel } from "@/components/recommendation-panel";
import { Button } from "@/components/ui/button";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ═══════════════════════════════════════════════════════════════
 * DASHBOARD PAGE - Overview & Insights Interface
 * ═══════════════════════════════════════════════════════════════
 *
 * This page connects to 3 backend algorithms:
 *
 * 1. FETCH TASKS - GET /api/tasks
 *    → Backend: Array filtering - O(n)
 *    → Used for: Upcoming tasks display, high priority section
 *    → Line: 30
 *
 * 2. ANALYTICS CALCULATION - GET /api/analytics
 *    → Algorithm: calculateAnalytics() - O(n)
 *    → Backend: algorithms.ts - Line 229
 *    → Returns: Completion rates, productivity score, trends
 *    → Used for: Statistics cards, metrics display
 *    → Line: 34
 *
 * 3. RECOMMENDATION ENGINE - GET /api/recommendations
 *    → Algorithm: generateRecommendations() - O(n)
 *    → Backend: algorithms.ts - Line 302
 *    → Returns: Smart alerts (break, workload, deadline, reschedule)
 *    → Used for: Intelligent suggestions panel
 *    → Line: 38
 * ═══════════════════════════════════════════════════════════════
 */
export default function Dashboard() {
  /**
   * ALGORITHM CONNECTION 1: Fetch Tasks
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/tasks
   * Backend: server/routes.ts - Line 35
   * Purpose: Gets all tasks for upcoming/high-priority sections
   */
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  /**
   * ALGORITHM CONNECTION 2: Analytics Calculation
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/analytics
   * Algorithm: calculateAnalytics() - O(n)
   * Backend: server/algorithms.ts - Line 229
   * Returns:
   *   - totalTasks, completedTasks, overdueTasks, pendingTasks
   *   - completionRate, productivityScore
   *   - tasksByPriority (high/medium/low distribution)
   *   - completionTrend (last 7 days)
   * Used in: Statistics cards showing task metrics
   */
  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<AnalyticsData>({
      queryKey: ["/api/analytics"],
    });

  /**
   * ALGORITHM CONNECTION 3: Recommendation Engine
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/recommendations
   * Algorithm: generateRecommendations() - O(n)
   * Backend: server/algorithms.ts - Line 302
   * Returns: Array<{
   *   type: "break" | "workload" | "reschedule" | "deadline"
   *   message: string
   *   severity: "info" | "warning" | "critical"
   *   relatedTasks?: string[]
   * }>
   * Displayed in: <RecommendationPanel /> component
   */
  const { data: recommendations } = useQuery<SmartRecommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const pendingTasks = tasks?.filter((t) => t.status === "pending") || [];
  const highPriorityTasks = pendingTasks
    .filter((t) => t.priority === "high")
    .slice(0, 3);
  const overdueTasks = tasks?.filter((t) => t.status === "overdue") || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI-Powered Task Scheduler
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Tasks
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold"
                  data-testid="text-total-tasks"
                >
                  {analytics?.totalTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.pendingTasks || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold text-success"
                  data-testid="text-completed-tasks"
                >
                  {analytics?.completedTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.completionRate.toFixed(1) || 0}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold text-destructive"
                  data-testid="text-overdue-tasks"
                >
                  {analytics?.overdueTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Productivity
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold text-primary"
                  data-testid="text-productivity-score"
                >
                  {analytics?.productivityScore.toFixed(0) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg: {analytics?.averageCompletionTime.toFixed(0) || 0}{" "}
                  min/task
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {recommendations && recommendations.length > 0 && (
        <RecommendationPanel recommendations={recommendations} />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">High Priority Tasks</h2>
            <Link href="/tasks">
              <Button
                variant="outline"
                size="sm"
                data-testid="link-view-all-tasks"
              >
                View All
              </Button>
            </Link>
          </div>

          {tasksLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : highPriorityTasks.length > 0 ? (
            <div className="space-y-4">
              {highPriorityTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No high priority tasks
              </p>
              <Link href="/tasks">
                <Button data-testid="button-create-first-task">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your Task
                </Button>
              </Link>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Stats</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-priority-high" />
                  <span className="text-sm">High</span>
                </div>
                <span className="font-mono text-sm font-medium">
                  {analytics?.tasksByPriority.high || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-priority-medium" />
                  <span className="text-sm">Medium</span>
                </div>
                <span className="font-mono text-sm font-medium">
                  {analytics?.tasksByPriority.medium || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-priority-low" />
                  <span className="text-sm">Low</span>
                </div>
                <span className="font-mono text-sm font-medium">
                  {analytics?.tasksByPriority.low || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {overdueTasks.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-base text-destructive">
                  Overdue Tasks
                </CardTitle>
                <CardDescription>
                  Tasks that need immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {overdueTasks.slice(0, 5).map((task) => (
                    <li key={task.id} className="text-sm">
                      {task.name}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
