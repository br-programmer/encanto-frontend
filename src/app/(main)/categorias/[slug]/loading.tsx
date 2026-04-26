import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-background-alt">
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
            <div
              key={i}
              className="bg-white dark:bg-stone-900 shadow-md"
            >
              <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
                <Skeleton className="aspect-4/5 w-full" />
              </div>
              <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 text-center space-y-2">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-5 w-16 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
