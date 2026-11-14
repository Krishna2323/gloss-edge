const Loading = () => (
  <div aria-busy="true" aria-label="Loading history" className="animate-pulse">
    <div className="flex items-center justify-between px-5">
      <div className="h-[34px] w-44 rounded-lg bg-ink-800" />
      <div className="size-11 rounded-[14px] bg-ink-800" />
    </div>
    <div className="flex gap-2.5 px-5 pt-7">
      <div className="h-[54px] flex-1 rounded-[18px] bg-ink-850" />
      <div className="h-[54px] w-24 rounded-[18px] bg-ink-850" />
    </div>
    <div className="flex gap-2.5 px-5 pt-[18px]">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-10 w-16 rounded-full bg-ink-850" />
      ))}
    </div>
    <div className="mx-6 mb-3.5 mt-8 h-3 w-16 rounded bg-ink-800" />
    <div className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-white/5 px-[18px] py-4"
        >
          <div className="flex flex-col gap-2">
            <div className="h-4 w-44 rounded bg-ink-800" />
            <div className="h-3 w-32 rounded bg-ink-800" />
          </div>
          <div className="h-5 w-8 rounded bg-ink-800" />
        </div>
      ))}
    </div>
  </div>
);

export default Loading;
