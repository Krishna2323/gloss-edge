const Loading = () => (
  <div aria-busy="true" aria-label="Loading home" className="animate-pulse">
    <div className="mx-5 mb-2 h-[18px] w-36 rounded bg-ink-800" />
    <div className="flex items-center justify-between px-5">
      <div className="h-[34px] w-28 rounded-lg bg-ink-800" />
      <div className="size-11 rounded-[14px] bg-ink-800" />
    </div>
    <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 px-5 pt-7">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[86px] rounded-[20px] bg-ink-850" />
      ))}
    </div>
    <div className="mx-6 mb-3.5 mt-10 h-4 w-20 rounded bg-ink-800" />
    <div className="mx-4 overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-3 border-b border-white/5 px-[18px] py-4"
        >
          <div className="flex justify-between">
            <div className="h-4 w-24 rounded bg-ink-800" />
            <div className="h-4 w-14 rounded bg-ink-800" />
          </div>
          <div className="h-1.5 rounded-full bg-ink-800" />
        </div>
      ))}
    </div>
  </div>
);

export default Loading;
