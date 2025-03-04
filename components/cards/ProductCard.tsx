import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";
// import { getTimeStamp } from "@/lib/utils";

import TagCard from "./CategoryCard";
import Metric from "../Metric";

interface Props {
  question: Product;
}

const ProductCard = ({
  question: {
    _id,
    categories,
    // createdAt,
    brand,
    description,
    title,
    stock,
    code,
    // quantity,
    // title,
    // author,
    // upvotes,
    // answers,
    // views,
  },
}: Props) => {
  return (
    <div className="card-wrapper min-w-56 rounded-[10px] border border-orange-100 p-6 shadow-lg sm:px-8">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          {/* <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimeStamp(createdAt)}
          </span> */}

          <Link href={ROUTES.PRODUCT(_id)}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title} - {brand}
            </h3>
          </Link>
        </div>
      </div>

      <div className="flex-between my-3 w-full flex-wrap gap-3">
        {/* <Metric
          imgUrl={author.image}
          alt={author.name}
          value={author.name}
          title={`• asked ${getTimeStamp(createdAt)}`}
          href={ROUTES.PROFILE(author._id)}
          textStyles="body-medium text-dark400_light700"
          isAuthor
        /> */}

        <div className="flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start">
          <Metric
            imgUrl="/icons/stack.svg"
            alt="quantity"
            value={stock}
            title=" Stock"
            // textStyles="text-dark400_light800"
            imgStyles="invert-colors"
          />
          <Metric
            imgUrl="/icons/hashtag.svg"
            alt="Code"
            value={code}
            title=" Code"
            // textStyles="text-dark400_light800"
            imgStyles="invert-colors"
          />
          {/* <Metric
            imgUrl="/icons/eye.svg"
            alt="views"
            value={views}
            title=" Views"
            textStyles="small-medium text-dark400_light800"
          /> */}
        </div>
      </div>
      <div className="mt-3.5 flex w-full flex-wrap gap-2">
        {categories.map((category) => (
          <TagCard
            key={category._id}
            _id={category._id}
            name={category.name}
            compact
          />
        ))}
      </div>
      <p className="mt-4 text-sm">{description}</p>
    </div>
  );
};

export default ProductCard;
