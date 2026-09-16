export default function ChapterLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="space-y-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-muted/70" />
        ))}
      </div>
    </div>
  )
}
