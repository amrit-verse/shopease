export default function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-square bg-slate-100" />
          <div className="p-4 space-y-2">
            <div className="h-5 rounded-md bg-slate-200" />
            <div className="h-4 rounded-md bg-slate-200 w-5/6" />
            <div className="h-10 rounded-md bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
