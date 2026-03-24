import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero Carousel Skeleton */}
      <section className="bg-background-alt py-4 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/6] w-full" />
        </div>
      </section>

      {/* Featured Products Carousel Skeleton */}
      <section className="py-10 sm:py-16 bg-background-alt">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-5 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-28 hidden sm:block" />
          </div>

          <div className="flex gap-4 lg:gap-5 py-4 px-2 -mx-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[45%] sm:w-[30%] lg:w-[23%]"
              >
                <div
                  className="bg-white dark:bg-stone-900 rounded-sm shadow-md"
                  style={{ transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)` }}
                >
                  <div className="p-2.5 pb-0 sm:p-3 sm:pb-0">
                    <Skeleton className="aspect-[4/5] w-full" />
                  </div>
                  <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 text-center space-y-2">
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                    <Skeleton className="h-5 w-16 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-9 w-64 mx-auto" />
            <Skeleton className="h-5 w-80 mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-warm-white">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
