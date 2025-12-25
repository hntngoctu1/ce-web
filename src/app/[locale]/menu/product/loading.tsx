export default function Loading() {
  return (
    <>
      {/* Breadcrumb skeleton */}
      <div className="sticky top-[72px] z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="flex items-center gap-2 py-2.5">
            <div className="h-3.5 w-3.5 rounded bg-gray-200" />
            <div className="h-3.5 w-1 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-5 w-8 rounded-full bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <section className="min-h-screen bg-gray-50/50 pb-16 pt-4">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="flex gap-5">
            {/* Sidebar skeleton */}
            <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
              <div className="sticky top-[120px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-200" />
                  <div className="h-4 w-12 rounded bg-gray-200" />
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-gray-100" />
                        <div className="h-4 w-20 rounded bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content skeleton */}
            <div className="min-w-0 flex-1">
              {/* Search bar skeleton */}
              <div className="sticky top-[120px] z-20 mb-4 space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 flex-1 rounded-lg bg-gray-100" />
                  <div className="h-5 w-32 rounded bg-gray-100" />
                  <div className="h-9 w-[140px] rounded-lg bg-gray-100" />
                  <div className="h-8 w-16 rounded-md bg-gray-100" />
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-24 rounded-full bg-gray-100" />
                  ))}
                </div>
              </div>

              {/* Product grid skeleton */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="aspect-[4/3] w-full bg-gray-100" />
                    <div className="flex-1 space-y-2 p-2">
                      <div className="h-4 w-4/5 rounded bg-gray-100" />
                      <div className="h-4 w-3/5 rounded bg-gray-100" />
                      <div className="h-4 w-1/3 rounded bg-gray-100" />
                    </div>
                    <div className="p-2 pt-0">
                      <div className="h-8 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
