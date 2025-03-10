import React from "react";

const InfoText = ({ text }: { text: string }) => {
  return (
    <section className="mt-8 flex w-full flex-col-reverse justify-between gap-2 p-6 text-center sm:flex-row sm:items-center">
      <h1 className="h2-semibold text-dark100_light900 w-full text-center">
        {text}
      </h1>
    </section>
  );
};

export default InfoText;
