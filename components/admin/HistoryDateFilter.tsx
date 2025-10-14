"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/url";
import { Button } from "@/components/ui/button";

const HistoryDateFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = (key: string, value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key,
      value,
    });
    router.push(newUrl);
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="body-medium text-dark400_light700">From</label>
        <input
          type="date"
          className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-10 rounded-1.5 border px-3 py-2"
          onChange={(e) =>
            update("from", new Date(e.target.value).toISOString())
          }
          defaultValue={searchParams.get("from")?.slice(0, 10) || ""}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="body-medium text-dark400_light700">To</label>
        <input
          type="date"
          className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-10 rounded-1.5 border px-3 py-2"
          onChange={(e) => {
            const d = new Date(e.target.value);
            // set to end of the selected day (local time)
            d.setHours(23, 59, 59, 999);
            update("to", d.toISOString());
          }}
          defaultValue={searchParams.get("to")?.slice(0, 10) || ""}
        />
      </div>
      <Button
        className="btn light-border-2 border"
        onClick={() => {
          const url1 = formUrlQuery({
            params: searchParams.toString(),
            key: "page",
            value: "1",
          });
          router.push(url1);
        }}
      >
        Apply
      </Button>
    </div>
  );
};

export default HistoryDateFilter;
