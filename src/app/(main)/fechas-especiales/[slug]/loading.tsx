import { Skeleton } from "@/components/ui/skeleton";

export default function SpecialDateLoading() {
  return (
    <div className="min-h-screen bg-background-alt">
      <div className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <Skeleton className="w-full aspect-[16/9] max-h-[70vh] rounded-none" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
