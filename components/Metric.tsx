import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles?: string;
  imgStyles?: string;
  isAuthor?: boolean;
}

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  imgStyles,
  isAuthor,
}: Props) => {
  const metricContent = (
    <>
      <Image
        src={imgUrl}
        width={14}
        height={14}
        alt={alt}
        className={`object-contain ${imgStyles} mr-1`}
      />
      <span
        className={`line-clamp-1 text-sm ${isAuthor ? "max-sm:hidden" : ""}`}
      >
        {title}
      </span>
      <span className="mr-1 font-bold">:</span>
      <p
        className={`${textStyles} flex items-center gap-1 text-sm font-semibold text-primary-500`}
      >
        {value}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className="flex-center">
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center ">{metricContent}</div>
  );
};

export default Metric;
