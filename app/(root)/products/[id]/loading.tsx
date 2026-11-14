const Loading = () => (
  <div aria-busy="true" aria-label="Loading product" className="animate-pulse">
    <div className="-mt-7 flex h-[250px] flex-col justify-between bg-ink-850 px-5 pb-6 pt-[18px] sm:rounded-b-[32px]">
      <div className="size-11 rounded-[14px] bg-ink-800" />
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-32 rounded bg-ink-800" />
          <div className="h-11 w-44 rounded-lg bg-ink-800" />
          <div className="h-3.5 w-52 rounded bg-ink-800" />
        </div>
        <div className="h-10 w-16 rounded-lg bg-ink-800" />
      </div>
    </div>
    <div className="grid grid-cols-[1.3fr_1fr_1fr] gap-3 px-5 pt-7">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[86px] rounded-[20px] bg-ink-850" />
      ))}
    </div>
    <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2.5 px-5 pt-7">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 rounded-2xl bg-ink-850" />
      ))}
    </div>
    <div className="mx-4 mt-[74px] h-48 rounded-3xl bg-ink-900" />
  </div>
);

export default Loading;
