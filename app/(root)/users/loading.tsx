const Loading = () => (
  <div aria-busy="true" aria-label="Loading users" className="animate-pulse">
    <div className="flex items-center justify-between px-5">
      <div className="h-[34px] w-36 rounded-lg bg-ink-800" />
      <div className="size-11 rounded-[14px] bg-ink-800" />
    </div>
    <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 px-5 pt-7">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[86px] rounded-[20px] bg-ink-850" />
      ))}
    </div>
    <div className="px-5 pt-7">
      <div className="h-[54px] rounded-[18px] bg-ink-850" />
    </div>
    <div className="mx-4 mt-[74px] overflow-hidden rounded-3xl border border-white/[0.06] bg-ink-900">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3.5 border-b border-white/5 p-[18px]"
        >
          <div className="size-11 rounded-[13px] bg-ink-800" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-28 rounded bg-ink-800" />
            <div className="h-3 w-40 rounded bg-ink-800" />
          </div>
          <div className="h-6 w-16 rounded-full bg-ink-800" />
        </div>
      ))}
    </div>
  </div>
);

export default Loading;
