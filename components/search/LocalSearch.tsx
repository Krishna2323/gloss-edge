"use client";

import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { formUrlQuery, removeKeysFromUrlQuery } from "@/lib/url";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
  disabled?: boolean;
}

const LocalSearch = ({
  route,
  imgSrc,
  placeholder,
  otherClasses,
  disabled,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (searchQuery) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "query",
        value: searchQuery,
      });

      router.push(newUrl, { scroll: false });
    } else {
      if (pathname === route) {
        const newUrl = removeKeysFromUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });

        router.push(newUrl, { scroll: false });
      }
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Input
        disabled={disabled}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
      <Button className="shadow-none" type="submit" onClick={onSubmit}>
        <Image
          src={imgSrc}
          width={32}
          height={32}
          alt="Search"
          className="cursor-pointer text-red-300"
        />
      </Button>
    </form>
  );
};

export default LocalSearch;
