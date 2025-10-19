import { useQuery } from "@tanstack/react-query";
import { AnalyticsData } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * ═══════════════════════════════════════════════════════════════
 * ANALYTICS PAGE - Data Visualization Dashboard
 * ═══════════════════════════════════════════════════════════════
 *
 * This page connects to 1 backend algorithm:
 *
 * ANALYTICS CALCULATION - GET /api/analytics
 * → Algorithm: calculateAnalytics() - O(n)
 * → Backend: algorithms.ts - Line 229
 * → Routes: server/routes.ts - Line 124
 *
 * Returns comprehensive task metrics:
 * - Task counts: total, completed, overdue, pending
 * - Performance: completionRate (%), productivityScore (0-100)
 * - Distribution: tasksByPriority { high, medium, low }
 * - Trends: completionTrend (last 7 days with dates)
 *
 * Visualizations:
 * 1. Line Chart: Completion trend over last 7 days
 * 2. Pie Chart: Tasks by priority (high/medium/low)
 * 3. Bar Chart: Task status (completed/overdue/pending)
 * 4. Stats Cards: Key metrics with icons
 * ═══════════════════════════════════════════════════════════════
 */
export default function Analytics() {
  /**
   * ALGORITHM CONNECTION: Analytics Calculation
   * ═══════════════════════════════════════════════════════════════
   * API: GET /api/analytics
   * Algorithm: calculateAnalytics() - O(n)
   * Backend: server/algorithms.ts - Line 229
   *
   * Data Flow:
   * 1. Frontend requests analytics
   * 2. Backend fetches all tasks from database
   * 3. Algorithm iterates through tasks once (O(n)) and calculates:
   *    - Task counts by status and priority
   *    - Completion rate percentage
   *    - Productivity score (weighted by priority)
   *    - 7-day completion trend
   * 4. Returns aggregated metrics
   * 5. Frontend renders charts and cards
   *
   * Used for: All charts and statistics on this page
   */
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const priorityData = [
    {
      name: "High",
      value: analytics?.tasksByPriority.high || 0,
      color: "hsl(var(--priority-high))",
    },
    {
      name: "Medium",
      value: analytics?.tasksByPriority.medium || 0,
      color: "hsl(var(--priority-medium))",
    },
    {
      name: "Low",
      value: analytics?.tasksByPriority.low || 0,
      color: "hsl(var(--priority-low))",
    },
  ];

  const completionData = [
    {
      name: "Completed",
      value: analytics?.completedTasks || 0,
      color: "hsl(var(--success))",
    },
    {
      name: "Overdue",
      value: analytics?.overdueTasks || 0,
      color: "hsl(var(--destructive))",
    },
    {
      name: "Pending",
      value: analytics?.pendingTasks || 0,
      color: "hsl(var(--chart-2))",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">
          Track your productivity and task completion metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold text-success"
              data-testid="text-completion-rate"
            >
              {analytics?.completionRate.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics?.completedTasks || 0} of {analytics?.totalTasks || 0}{" "}
              tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Completion Time
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold"
              data-testid="text-avg-completion-time"
            >
              {analytics?.averageCompletionTime.toFixed(0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              minutes per task
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productivity Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold text-primary"
              data-testid="text-productivity-score"
            >
              {analytics?.productivityScore.toFixed(0) || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              based on completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div
              className="text-3xl font-bold text-destructive"
              data-testid="text-overdue-count"
            >
              {analytics?.overdueTasks || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              require attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Completion Trends</CardTitle>
            <CardDescription>
              Tasks completed and overdue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.completionTrend || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="overdue"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="Overdue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of task statuses</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={completionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {completionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks organized by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  className="text-xs"
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key productivity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Tasks Created</span>
              <span className="font-mono font-bold">
                {analytics?.totalTasks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks Completed</span>
              <span className="font-mono font-bold text-success">
                {analytics?.completedTasks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks Pending</span>
              <span className="font-mono font-bold text-chart-2">
                {analytics?.pendingTasks || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks Overdue</span>
              <span className="font-mono font-bold text-destructive">
                {analytics?.overdueTasks || 0}
              </span>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Productivity Score</span>
                <span className="font-mono text-2xl font-bold text-primary">
                  {analytics?.productivityScore.toFixed(0) || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
