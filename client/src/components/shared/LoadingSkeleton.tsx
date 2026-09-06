import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-border px-4 py-3 last:border-0">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-0">
          <Skeleton className="aspect-[4/3] w-full rounded-b-none rounded-t-lg" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

interface LoadingSkeletonProps {
  variant: "table" | "card-grid" | "form";
  className?: string;
}

export function LoadingSkeleton({ variant, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("p-4 md:p-6", className)}>
      {variant === "table" && <TableSkeleton />}
      {variant === "card-grid" && <CardGridSkeleton />}
      {variant === "form" && <FormSkeleton />}
    </div>
  );
}
