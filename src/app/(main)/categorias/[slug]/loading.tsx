import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-5 w-60" />
        </div>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-96 mt-2" />
        <Skeleton className="h-4 w-24 mt-4" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-background rounded-xl border border-border overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-20 mt-2" />
                <Skeleton className="h-9 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
