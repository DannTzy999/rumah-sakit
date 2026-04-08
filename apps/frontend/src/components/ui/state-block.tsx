import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
      <span className="inline-flex items-center gap-2">
        <Loader2 className="size-4 animate-spin" />
        {label}
      </span>
    </div>
  );
}

export function ErrorBlock({
  message = "Something went wrong",
  onRetry
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-4 text-sm">
      <div className="inline-flex items-center gap-2 font-medium text-[hsl(var(--destructive))]">
        <AlertTriangle className="size-4" />
        Error
      </div>
      <p className="mt-1 text-[hsl(var(--muted-foreground))]">{message}</p>
      {onRetry ? (
        <Button className="mt-3" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({ message = "No data" }: { message?: string }) {
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
      {message}
    </div>
  );
}
