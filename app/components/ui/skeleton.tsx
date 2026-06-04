export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-800 ${className ?? ""}`} />;
}

export function ArtistCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex flex-col gap-2">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-6 w-full rounded-full" />
      <Skeleton className="h-6 w-full rounded-full" />
    </div>
  );
}

export function ArtistListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2 px-3 border-b border-slate-800/60">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-5 w-6 rounded-full" />
      <Skeleton className="h-3 w-24 hidden sm:block" />
      <Skeleton className="h-3 w-40 flex-1" />
    </div>
  );
}

export function CalcSectionSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
