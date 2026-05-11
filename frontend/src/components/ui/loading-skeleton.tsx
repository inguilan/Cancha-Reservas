export function LoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className="mb-4 h-5 w-1/2 rounded bg-brand-100" />
      <div className="mb-2 h-4 w-full rounded bg-brand-50" />
      <div className="h-4 w-3/4 rounded bg-brand-50" />
    </div>
  );
}
