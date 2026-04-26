import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-5 w-80" />
        </div>
      </div>

      {/* Product Detail */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg shrink-0" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="pt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-4 w-32 mt-4" />
            <div className="pt-4 flex items-center gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-12 w-32" />
            </div>
            <Skeleton className="h-14 w-full mt-4" />
            <Skeleton className="h-24 w-full mt-6 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
