import { SmartRecommendation } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, AlertTriangle, Calendar, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RecommendationPanelProps {
  recommendations: SmartRecommendation[];
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  if (recommendations.length === 0) {
    return null;
  }

  const activeRecommendations = recommendations.filter((_, index) => !dismissed.has(index));

  if (activeRecommendations.length === 0) {
    return null;
  }

  const getIcon = (type: SmartRecommendation["type"]) => {
    switch (type) {
      case "break":
        return Coffee;
      case "workload":
        return AlertTriangle;
      case "reschedule":
        return Calendar;
      default:
        return Info;
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeRecommendations.map((rec, index) => {
          const Icon = getIcon(rec.type);
          const originalIndex = recommendations.indexOf(rec);
          
          return (
            <div
              key={originalIndex}
              className={cn(
                "flex items-start gap-3 p-3 rounded-md",
                rec.severity === "critical" && "bg-destructive/10 border border-destructive/20",
                rec.severity === "warning" && "bg-warning/10 border border-warning/20",
                rec.severity === "info" && "bg-primary/10 border border-primary/20"
              )}
              data-testid={`recommendation-${rec.type}-${originalIndex}`}
            >
              <Icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 mt-0.5",
                  rec.severity === "critical" && "text-destructive",
                  rec.severity === "warning" && "text-warning",
                  rec.severity === "info" && "text-primary"
                )}
              />
              <p className="text-sm flex-1">{rec.message}</p>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 flex-shrink-0"
                onClick={() => setDismissed((prev) => new Set(prev).add(originalIndex))}
                data-testid={`button-dismiss-${originalIndex}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
