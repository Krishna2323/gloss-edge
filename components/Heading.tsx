import React from "react";

const Heading = ({ text }: { text: string }) => {
  return (
    <section className="mb-4 flex w-full flex-col-reverse justify-between gap-2 sm:flex-row sm:items-center">
      <h1 className="h2-bold text-dark100_light900">{text}</h1>
    </section>
  );
};

export default Heading;
