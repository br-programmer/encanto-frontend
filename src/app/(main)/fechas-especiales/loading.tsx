import { Skeleton } from "@/components/ui/skeleton";

export default function FechasEspecialesLoading() {
  return (
    <div className="min-h-screen bg-background-alt">
      <div className="bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Skeleton className="h-9 sm:h-10 w-56 sm:w-72" />
        <Skeleton className="h-4 sm:h-5 w-72 sm:w-96 mt-2" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-stone-900 shadow-md border border-secondary"
            >
              <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
                <Skeleton className="aspect-4/3 w-full rounded-none" />
              </div>
              <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 space-y-2">
                <Skeleton className="h-5 w-3/4 mx-auto rounded-none" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
