import { assetUrl } from "@/lib/cdn";
import React from "react";

export default function GridShape() {
  // Decorative backgrounds avoid image-scanner extensions mutating SSR <img> attributes.
  const gridStyle = {
    aspectRatio: "540 / 254",
    backgroundImage: `url("${assetUrl("/images/shape/grid-01.svg")}")`,
  };
  return (
    <>
      <div aria-hidden="true" className="absolute right-0 top-0 -z-1 w-full max-w-[250px] bg-contain bg-no-repeat xl:max-w-[450px]" style={gridStyle} />
      <div aria-hidden="true" className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 bg-contain bg-no-repeat xl:max-w-[450px]" style={gridStyle} />
    </>
  );
}
